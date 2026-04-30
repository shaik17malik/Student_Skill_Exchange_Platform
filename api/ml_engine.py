# Lightweight Matching Engine (Optimized for Vercel)
import math
from collections import Counter

def get_skill_matching(user_id):
    """
    Lightweight Skill Matching using pure Python (no pandas/sklearn).
    Calculates cosine similarity between skill name strings.
    """
    from .models import Profile, Review
    from django.db.models import Avg

    try:
        current_profile = Profile.objects.get(user__id=user_id)
        # Combine all wanted skills into a single string
        current_wants = [s.get('name', '').lower() for s in current_profile.skills_want]
    except Profile.DoesNotExist:
        return []

    if not current_wants:
        return []

    other_profiles = Profile.objects.exclude(user__id=user_id)
    results = []

    for p in other_profiles:
        have_skills = [s.get('name', '').lower() for s in p.skills_have]
        if not have_skills:
            continue
        
        # Calculate a simple intersection score
        score = 0
        for want in current_wants:
            if want in have_skills:
                score += 1
        
        if score > 0:
            avg = Review.objects.filter(reviewee=p.user).aggregate(avg=Avg('rating'))['avg'] or 0
            results.append({
                'user_id': p.user.id,
                'username': p.user.username,
                'match_score': round((score / len(current_wants)) * 100, 2),
                'skills_have': p.skills_have,
                'skills_want': p.skills_want,
                'avg_rating': round(avg, 1),
                'points': p.points,
                'bio': p.bio,
            })

    # Sort by score
    results.sort(key=lambda x: x['match_score'], reverse=True)
    return results[:10]


def get_trending_skills():
    """Lightweight Trending Skills using Counter."""
    from .models import Profile
    all_wants = []
    for p in Profile.objects.all():
        for skill in p.skills_want:
            all_wants.append(skill.get('name', ''))
    
    if not all_wants:
        return []
        
    counts = Counter(all_wants).most_common(10)
    return [{'skill': k, 'demand': v} for k, v in counts]


def rank_mentors():
    """Lightweight Mentor Ranking."""
    from .models import Profile, Review
    from django.db.models import Avg

    profiles = Profile.objects.all()
    data = []
    for p in profiles:
        avg = Review.objects.filter(reviewee=p.user).aggregate(avg=Avg('rating'))['avg'] or 0
        # Simple weighted score
        score = (p.points * 0.4) + (avg * 12)
        data.append({
            'user_id': p.user.id,
            'username': p.user.username,
            'points': p.points,
            'avg_rating': round(avg, 1),
            'score': round(score, 2),
        })

    data.sort(key=lambda x: x['score'], reverse=True)
    return data[:10]
