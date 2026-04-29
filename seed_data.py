import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import User, Profile

def seed():
    # Create sample users
    users_data = [
        {"username": "alice", "email": "alice@college.edu", "password": "password123", "skills_have": [{"name": "Python", "level": "Expert"}], "skills_want": [{"name": "React", "level": "Beginner"}]},
        {"username": "bob", "email": "bob@college.edu", "password": "password123", "skills_have": [{"name": "React", "level": "Intermediate"}, {"name": "JavaScript", "level": "Expert"}], "skills_want": [{"name": "Python", "level": "Beginner"}]},
        {"username": "charlie", "email": "charlie@college.edu", "password": "password123", "skills_have": [{"name": "Java", "level": "Expert"}], "skills_want": [{"name": "DBMS", "level": "Intermediate"}]},
        {"username": "diana", "email": "diana@college.edu", "password": "password123", "skills_have": [{"name": "DBMS", "level": "Expert"}, {"name": "SQL", "level": "Expert"}], "skills_want": [{"name": "Java", "level": "Beginner"}]},
    ]

    for data in users_data:
        if not User.objects.filter(username=data['username']).exists():
            user = User.objects.create_user(
                username=data['username'],
                email=data['email'],
                password=data['password']
            )
            Profile.objects.create(
                user=user,
                bio=f"Hi, I'm {data['username']}.",
                skills_have=data['skills_have'],
                skills_want=data['skills_want']
            )
            print(f"Created user {data['username']}")

if __name__ == '__main__':
    seed()
