from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    # Extending default user
    phone = models.CharField(max_length=15, blank=True, null=True)
    college = models.CharField(max_length=255, blank=True, null=True)
    branch = models.CharField(max_length=255, blank=True, null=True)
    department = models.CharField(max_length=255, blank=True, null=True)
    year = models.IntegerField(blank=True, null=True)
    semester = models.IntegerField(blank=True, null=True)
    
    # Custom fields can be expanded later
    
    def __str__(self):
        return self.username

class Skill(models.fields.CharField):
    pass # we can define a separate table or just use choices

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True, null=True)
    photo_url = models.URLField(blank=True, null=True)
    portfolio_link = models.URLField(blank=True, null=True)
    github_link = models.URLField(blank=True, null=True)
    
    # For simplicity, store skills as JSON arrays or comma-separated strings.
    # In a real app, a ManyToManyField to a Skill model is better.
    # We will use JSONField (sqlite supports it in Django 3.1+)
    skills_have = models.JSONField(default=list, blank=True) # e.g., [{"name": "Python", "level": "Expert"}]
    skills_want = models.JSONField(default=list, blank=True)
    
    # Gamification
    points = models.IntegerField(default=0)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"

class Message(models.fields.CharField):
    pass

class ChatMessage(models.Model):
    sender = models.ForeignKey(User, related_name='sent_messages', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='received_messages', on_delete=models.CASCADE)
    content = models.TextField(blank=True, null=True)
    file_attachment = models.FileField(upload_to='chat_files/', blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"From {self.sender.username} to {self.receiver.username} at {self.timestamp}"

class ChatRequest(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted'),
        ('REJECTED', 'Rejected'),
    ]
    sender = models.ForeignKey(User, related_name='sent_requests', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='received_requests', on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('sender', 'receiver')

    def __str__(self):
        return f"Chat request from {self.sender.username} to {self.receiver.username} ({self.status})"

class Session(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted'),
        ('REJECTED', 'Rejected'),
        ('COMPLETED', 'Completed'),
    ]
    
    requester = models.ForeignKey(User, related_name='requested_sessions', on_delete=models.CASCADE)
    provider = models.ForeignKey(User, related_name='provided_sessions', on_delete=models.CASCADE)
    skill_name = models.CharField(max_length=255)
    date_time = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    meeting_link = models.URLField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.requester.username} learning {self.skill_name} from {self.provider.username}"

class Review(models.Model):
    reviewer = models.ForeignKey(User, related_name='reviews_given', on_delete=models.CASCADE)
    reviewee = models.ForeignKey(User, related_name='reviews_received', on_delete=models.CASCADE)
    session = models.OneToOneField(Session, on_delete=models.SET_NULL, null=True, blank=True)
    rating = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    feedback = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Review by {self.reviewer.username} for {self.reviewee.username} ({self.rating}/5)"
