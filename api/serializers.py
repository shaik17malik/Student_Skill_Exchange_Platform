from rest_framework import serializers
from .models import User, Profile, ChatMessage, Session, Review

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'phone', 'college', 'department', 'branch', 'year', 'semester']

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Profile
        fields = ['id', 'user', 'bio', 'photo_url', 'portfolio_link', 'github_link', 'skills_have', 'skills_want', 'points']

class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    receiver_name = serializers.CharField(source='receiver.username', read_only=True)

    class Meta:
        model = ChatMessage
        fields = ['id', 'sender', 'sender_name', 'receiver', 'receiver_name', 'content', 'file_attachment', 'timestamp']

class SessionSerializer(serializers.ModelSerializer):
    requester_name = serializers.CharField(source='requester.username', read_only=True)
    provider_name = serializers.CharField(source='provider.username', read_only=True)

    class Meta:
        model = Session
        fields = ['id', 'requester', 'requester_name', 'provider', 'provider_name', 'skill_name', 'date_time', 'status', 'meeting_link']

class ReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.CharField(source='reviewer.username', read_only=True)
    reviewee_name = serializers.CharField(source='reviewee.username', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'reviewer', 'reviewer_name', 'reviewee', 'reviewee_name', 'session', 'rating', 'feedback', 'created_at']
