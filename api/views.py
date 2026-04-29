from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.db.models import Q, Avg
from .models import User, Profile, ChatMessage, ChatRequest, Session, Review
from .serializers import UserSerializer, ProfileSerializer, ChatMessageSerializer, SessionSerializer, ReviewSerializer
from .ml_engine import get_skill_matching, get_trending_skills, rank_mentors

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def upload_certificate(request):
    """Upload a certificate image and return its URL."""
    file = request.FILES.get('certificate')
    if not file:
        return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
    import os
    from django.conf import settings
    save_dir = os.path.join(settings.MEDIA_ROOT, 'certificates')
    os.makedirs(save_dir, exist_ok=True)
    # Sanitize filename
    filename = f"{file.name.replace(' ', '_')}"
    filepath = os.path.join(save_dir, filename)
    with open(filepath, 'wb+') as dest:
        for chunk in file.chunks():
            dest.write(chunk)
    url = f"{settings.MEDIA_URL}certificates/{filename}"
    return Response({'url': url, 'filename': filename})


# ─── AUTH ────────────────────────────────────────────────────────────────────

@api_view(['POST'])
def register_user(request):
    data = request.data
    try:
        user = User.objects.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            first_name=data.get('name', ''),
            phone=data.get('phone', ''),
            college=data.get('college', ''),
            department=data.get('department', ''),
            branch=data.get('branch', ''),
            year=data.get('year') or None,
            semester=data.get('semester') or None
        )
        Profile.objects.create(
            user=user,
            skills_have=data.get('skills_have', []),
            skills_want=data.get('skills_want', [])
        )
        return Response({'message': 'User registered successfully!', 'user_id': user.id}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def login_user(request):
    data = request.data
    user = authenticate(username=data.get('username'), password=data.get('password'))
    if user is not None:
        return Response({'message': 'Login successful', 'user_id': user.id, 'username': user.username})
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


# ─── USERS & PROFILES ────────────────────────────────────────────────────────

@api_view(['GET'])
def get_users(request):
    profiles = Profile.objects.all()
    serializer = ProfileSerializer(profiles, many=True)
    return Response(serializer.data)


@api_view(['GET', 'PUT'])
def profile_api(request, user_id):
    try:
        profile = Profile.objects.get(user__id=user_id)
    except Profile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        # Also attach average rating
        avg = Review.objects.filter(reviewee_id=user_id).aggregate(avg=Avg('rating'))['avg']
        data = ProfileSerializer(profile).data
        data['avg_rating'] = round(avg, 1) if avg else 0
        return Response(data)

    elif request.method == 'PUT':
        data = request.data
        # Update user fields
        user = profile.user
        user.first_name = data.get('name', user.first_name)
        user.phone = data.get('phone', user.phone)
        user.college = data.get('college', user.college)
        user.department = data.get('department', user.department)
        user.branch = data.get('branch', user.branch)
        user.year = data.get('year', user.year)
        user.semester = data.get('semester', user.semester)
        user.save()
        # Update profile fields
        profile.bio = data.get('bio', profile.bio)
        profile.photo_url = data.get('photo_url', profile.photo_url)
        profile.github_link = data.get('github_link', profile.github_link)
        profile.portfolio_link = data.get('portfolio_link', profile.portfolio_link)
        if 'skills_have' in data:
            profile.skills_have = data['skills_have']
        if 'skills_want' in data:
            profile.skills_want = data['skills_want']
        profile.save()
        return Response({'message': 'Profile updated!'})


# ─── SEARCH & FILTER ─────────────────────────────────────────────────────────

@api_view(['GET'])
def search_users(request):
    """
    Search by skill name, filter by level, category, min_rating.
    GET /api/search/?q=python&level=Expert&category=Technical&min_rating=4
    """
    q = request.query_params.get('q', '').lower()
    level = request.query_params.get('level', '').lower()
    category = request.query_params.get('category', '').lower()
    min_rating = float(request.query_params.get('min_rating', 0))

    results = []
    profiles = Profile.objects.all()

    for profile in profiles:
        for skill in profile.skills_have:
            skill_name = skill.get('name', '').lower()
            skill_level = skill.get('level', '').lower()
            skill_cat = skill.get('category', '').lower()

            # Apply filters
            if q and q not in skill_name:
                continue
            if level and level not in skill_level:
                continue
            if category and category not in skill_cat:
                continue

            # Check rating
            avg = Review.objects.filter(reviewee=profile.user).aggregate(avg=Avg('rating'))['avg'] or 0
            if avg < min_rating:
                continue

            results.append({
                'user_id': profile.user.id,
                'username': profile.user.username,
                'name': profile.user.first_name,
                'college': profile.user.college,
                'bio': profile.bio,
                'photo_url': profile.photo_url,
                'matched_skill': skill,
                'skills_have': profile.skills_have,
                'skills_want': profile.skills_want,
                'avg_rating': round(avg, 1),
                'points': profile.points
            })
            break  # one result per user

    return Response(results)


# ─── MATCHING (ML) ────────────────────────────────────────────────────────────

@api_view(['POST'])
def get_matches(request):
    user_id = request.data.get('user_id')
    if not user_id:
        return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    matches = get_skill_matching(user_id)
    return Response(matches)


@api_view(['GET'])
def trending_skills(request):
    """Return top trending skills across the platform based on demand."""
    trends = get_trending_skills()
    return Response(trends)


@api_view(['GET'])
def top_mentors(request):
    """Return ranked mentors using ML (points + rating)."""
    mentors = rank_mentors()
    return Response(mentors)


# ─── CHAT (FILE SUPPORT) ─────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
def message_api(request):
    if request.method == 'GET':
        user_id = request.query_params.get('user_id')
        other_id = request.query_params.get('other_id')
        messages = ChatMessage.objects.filter(
            sender_id__in=[user_id, other_id],
            receiver_id__in=[user_id, other_id]
        ).order_by('timestamp')
        serializer = ChatMessageSerializer(messages, many=True, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'POST':
        # Support multipart/form-data for file uploads
        serializer = ChatMessageSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─── SESSIONS (with Jitsi) ───────────────────────────────────────────────────

@api_view(['GET', 'POST', 'PATCH', 'DELETE'])
def session_api(request):
    if request.method == 'GET':
        user_id = request.query_params.get('user_id')
        sessions = Session.objects.filter(requester_id=user_id) | Session.objects.filter(provider_id=user_id)
        serializer = SessionSerializer(sessions, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        data = request.data.copy()
        import uuid
        room_id = str(uuid.uuid4())[:8]
        # Jitsi Meet — no API key needed, instant video call
        data['meeting_link'] = f"https://meet.jit.si/SkillExchange-{room_id}"
        serializer = SessionSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'PATCH':
        # Accept / Reject a session
        session_id = request.data.get('session_id')
        new_status = request.data.get('status')
        try:
            session = Session.objects.get(id=session_id)
            session.status = new_status
            session.save()
            return Response({'message': f'Session status updated to {new_status}'})
        except Session.DoesNotExist:
            return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)

    elif request.method == 'DELETE':
        session_id = request.data.get('session_id')
        user_id = request.data.get('user_id')
        try:
            session = Session.objects.get(id=session_id)
            # Only the requester can delete (cancel) a session
            if session.requester_id != int(user_id):
                return Response({'error': 'Only the requester can cancel this session'}, status=status.HTTP_403_FORBIDDEN)
            session.delete()
            return Response({'message': 'Session cancelled successfully'})
        except Session.DoesNotExist:
            return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)


# ─── REVIEWS ─────────────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
def review_api(request):
    if request.method == 'GET':
        user_id = request.query_params.get('user_id')
        reviews = Review.objects.filter(reviewee_id=user_id).order_by('-created_at')
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            reviewee = serializer.validated_data['reviewee']
            try:
                profile = Profile.objects.get(user=reviewee)
                profile.points += 10  # 10 points per review received
                profile.save()
            except Profile.DoesNotExist:
                pass
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─── DASHBOARD ───────────────────────────────────────────────────────────────

@api_view(['GET'])
def dashboard_data(request):
    user_id = request.query_params.get('user_id')
    try:
        profile = Profile.objects.get(user__id=user_id)
        sessions_count = Session.objects.filter(
            Q(requester_id=user_id) | Q(provider_id=user_id)
        ).count()
        reviews_count = Review.objects.filter(reviewee_id=user_id).count()
        avg = Review.objects.filter(reviewee_id=user_id).aggregate(avg=Avg('rating'))['avg']

        return Response({
            'profile': ProfileSerializer(profile).data,
            'stats': {
                'total_sessions': sessions_count,
                'total_reviews': reviews_count,
                'points': profile.points,
                'avg_rating': round(avg, 1) if avg else 0
            }
        })
    except Profile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)


# ─── AI CHAT ASSISTANT ───────────────────────────────────────────────────────

@api_view(['POST'])
def ai_chat_api(request):
    prompt = request.data.get('prompt', '').lower()
    if not prompt:
        return Response({'error': 'Prompt is required'}, status=status.HTTP_400_BAD_REQUEST)

    response_text = "🤖 SkillBot: "

    if 'python' in prompt:
        response_text += "Python is a powerful language! Start with: Variables → Loops → Functions → OOP → Libraries. Want me to find Python mentors for you? Go to 'Find Matches'!"
    elif 'react' in prompt or 'javascript' in prompt:
        response_text += "React is built on JavaScript. Learning path: HTML → CSS → JavaScript → React → Next.js. Check our React experts in 'Find Matches'!"
    elif 'java' in prompt:
        response_text += "Java is great for enterprise apps and Android. Path: Basics → OOP → Data Structures → Spring Boot. Find Java mentors in the Search page!"
    elif 'dbms' in prompt or 'database' in prompt or 'sql' in prompt:
        response_text += "Databases are essential! Start with SQL basics → Normalization → Joins → Indexes → NoSQL. Great skill to exchange!"
    elif 'machine learning' in prompt or 'ml' in prompt or 'ai' in prompt:
        response_text += "ML path: Python → NumPy/Pandas → Scikit-Learn → Deep Learning → TensorFlow/PyTorch. It's a hot skill right now!"
    elif 'certificate' in prompt:
        response_text += "Certificates are awarded when your skill exchanges are rated 4+ stars. Complete sessions and collect great reviews to earn them!"
    elif 'match' in prompt or 'find' in prompt:
        response_text += "Go to 'Find Matches' to see your ML-powered skill matches, or use 'Search' to find specific skills manually!"
    elif 'help' in prompt:
        response_text += "I can help with: skill roadmaps, platform navigation, coding doubts, or finding the right mentor. Just ask!"
    elif 'book' in prompt or 'session' in prompt:
        response_text += "To book a session: Go to Sessions → Click 'Book New Session' → Select a user and skill → A Jitsi meeting link will be auto-generated for you!"
    elif 'chat' in prompt:
        response_text += "You can chat one-on-one with any registered student! Go to the Chat tab, pick a user, and start messaging. You can also send files!"
    else:
        response_text += f"Great question about '{prompt}'! I suggest exploring the 'Find Matches' or 'Search' pages for experts in this topic. You can also book a learning session!"

    return Response({'response': response_text})

@api_view(['GET', 'POST', 'PATCH'])
def chat_request_api(request):
    """
    GET  ?user_id=X         → all requests involving user X
    POST {sender, receiver} → send a new chat request
    PATCH {request_id, status} → accept or reject
    """
    if request.method == 'GET':
        user_id = request.query_params.get('user_id')
        received = ChatRequest.objects.filter(receiver_id=user_id)
        sent     = ChatRequest.objects.filter(sender_id=user_id)

        def fmt(r):
            return {
                'id': r.id,
                'sender_id': r.sender.id,
                'sender_username': r.sender.username,
                'receiver_id': r.receiver.id,
                'receiver_username': r.receiver.username,
                'status': r.status,
                'created_at': r.created_at,
            }
        return Response({
            'received': [fmt(r) for r in received],
            'sent':     [fmt(r) for r in sent],
        })

    elif request.method == 'POST':
        sender_id   = request.data.get('sender')
        receiver_id = request.data.get('receiver')
        if not sender_id or not receiver_id:
            return Response({'error': 'sender and receiver required'}, status=status.HTTP_400_BAD_REQUEST)
        # Prevent duplicate requests
        obj, created = ChatRequest.objects.get_or_create(
            sender_id=sender_id,
            receiver_id=receiver_id,
            defaults={'status': 'PENDING'}
        )
        return Response({'id': obj.id, 'status': obj.status, 'created': created},
                        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    elif request.method == 'PATCH':
        request_id = request.data.get('request_id')
        new_status = request.data.get('status')
        try:
            req = ChatRequest.objects.get(id=request_id)
            req.status = new_status
            req.save()
            return Response({'message': f'Chat request {new_status.lower()}'})
        except ChatRequest.DoesNotExist:
            return Response({'error': 'Request not found'}, status=status.HTTP_404_NOT_FOUND)
