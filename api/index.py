import os
from django.core.wsgi import get_wsgi_application

# Export the Django WSGI application as 'app' for Vercel
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

application = get_wsgi_application()
app = application
