from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('users/', views.get_users, name='users'),
    path('profile/<int:user_id>/', views.profile_api, name='profile'),
    path('search/', views.search_users, name='search'),
    path('match/', views.get_matches, name='match'),
    path('trending/', views.trending_skills, name='trending'),
    path('top_mentors/', views.top_mentors, name='top_mentors'),
    path('message/', views.message_api, name='message'),
    path('session/', views.session_api, name='session'),
    path('review/', views.review_api, name='review'),
    path('dashboard/', views.dashboard_data, name='dashboard'),
    path('ai_chat/', views.ai_chat_api, name='ai_chat'),
    path('chat_request/', views.chat_request_api, name='chat_request'),
    path('upload_certificate/', views.upload_certificate, name='upload_certificate'),
]
