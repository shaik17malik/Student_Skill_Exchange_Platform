import os
import sys
from django.core.wsgi import get_wsgi_application

# Add the project root to the python path so Vercel can find the 'backend' folder
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

application = get_wsgi_application()
app = application
