import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def get_skill_matching(user_id):
    """
    Skill Matching Engine — Cosine Similarity on TF-IDF skill vectors.
    Finds users whose skills_have match the current user's skills_want.
    """
    # Lazy import to avoid circular imports
    from .models import Profile, Review
    from django.db.models import Avg

    try:
        current_profile = Profile.objects.get(user__id=user_id)
        current_wants = " ".join([s.get('name', '') for s in current_profile.skills_want])
    except Profile.DoesNotExist:
        return []

    if not current_wants.strip():
        return []

    other_profiles = Profile.objects.exclude(user__id=user_id)

    match_data = []
    for p in other_profiles:
        have_skills = " ".join([s.get('name', '') for s in p.skills_have])
        if have_skills.strip():
            avg = Review.objects.filter(reviewee=p.user).aggregate(avg=Avg('rating'))['avg'] or 0
            match_data.append({
                'user_id': p.user.id,
                'username': p.user.username,
                'skills_have': p.skills_have,
                'skills_want': p.skills_want,
                'bio': p.bio,
                'photo_url': p.photo_url,
                'avg_rating': round(avg, 1),
                'points': p.points,
                'have_text': have_skills,
            })

    if not match_data:
        return []

    df = pd.DataFrame(match_data)
    vectorizer = TfidfVectorizer()
    all_texts = [current_wants] + df['have_text'].tolist()
    tfidf_matrix = vectorizer.fit_transform(all_texts)
    cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
    df['similarity'] = cosine_sim
    df = df.sort_values(by='similarity', ascending=False)
    top_matches = df[df['similarity'] > 0].head(10)

    results = []
    for _, row in top_matches.iterrows():
        results.append({
            'user_id': int(row['user_id']),
            'username': row['username'],
            'bio': row['bio'],
            'photo_url': row['photo_url'],
            'match_score': round(row['similarity'] * 100, 2),
            'skills_have': row['skills_have'],
            'skills_want': row['skills_want'],
            'avg_rating': row['avg_rating'],
            'points': int(row['points']),
        })
    return results


def get_trending_skills():
    """
    Skill Demand Prediction: aggregate the most frequently 'wanted' skills
    across all users using Pandas.
    """
    from .models import Profile

    all_wants = []
    for p in Profile.objects.all():
        for skill in p.skills_want:
            all_wants.append(skill.get('name', ''))

    if not all_wants:
        return []

    series = pd.Series(all_wants)
    counts = series.value_counts().reset_index()
    counts.columns = ['skill', 'demand']
    return counts.head(10).to_dict(orient='records')


def rank_mentors():
    """
    Mentor Ranking System: rank users by a weighted score of
    points and average rating using Pandas.
    Formula: score = (points * 0.4) + (avg_rating * 20 * 0.6)
    """
    from .models import Profile, Review
    from django.db.models import Avg

    profiles = Profile.objects.all()
    data = []
    for p in profiles:
        avg = Review.objects.filter(reviewee=p.user).aggregate(avg=Avg('rating'))['avg'] or 0
        score = (p.points * 0.4) + (avg * 20 * 0.6)
        data.append({
            'user_id': p.user.id,
            'username': p.user.username,
            'name': p.user.first_name,
            'bio': p.bio,
            'photo_url': p.photo_url,
            'points': p.points,
            'avg_rating': round(avg, 1),
            'score': round(score, 2),
        })

    if not data:
        return []

    df = pd.DataFrame(data)
    df = df.sort_values(by='score', ascending=False)
    return df.head(10).to_dict(orient='records')


def recommend_learning_path(skill):
    """Learning Path Recommendation."""
    paths = {
        'html': ['CSS', 'JavaScript', 'React', 'Next.js'],
        'css': ['JavaScript', 'Tailwind CSS', 'React'],
        'python': ['Django', 'Flask', 'Machine Learning', 'Data Science'],
        'java': ['Spring Boot', 'Microservices', 'Android Development'],
        'javascript': ['React', 'Node.js', 'TypeScript', 'Next.js'],
        'react': ['TypeScript', 'Next.js', 'Redux', 'Testing'],
        'sql': ['PostgreSQL', 'MongoDB', 'Data Warehousing'],
    }
    return paths.get(skill.lower(), [f'Advanced {skill}', 'Projects', 'Certifications'])


def detect_spam(text):
    """Chat Moderation — keyword-based spam detection."""
    spam_keywords = ['free money', 'click here', 'buy now', 'win prize', 'limited offer']
    text_lower = text.lower()
    return any(kw in text_lower for kw in spam_keywords)


def check_fake_profile(profile_data):
    """Fake Profile Detection — heuristic-based."""
    has_bio = bool(profile_data.get('bio'))
    has_skills = bool(profile_data.get('skills_have'))
    has_photo = bool(profile_data.get('photo_url'))
    score = sum([has_bio, has_skills, has_photo])
    return score < 2  # Suspicious if profile has fewer than 2 of 3 fields
