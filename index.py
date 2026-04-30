import os
from django.core.wsgi import get_wsgi_application

# Vercel entry point in the root
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

application = get_wsgi_application()
app = application
