import os
import sys

# Override sqlite3 for Vercel (fixes "SQLite 3.9.0 or newer is required" error)
try:
    __import__('pysqlite3')
    import sys
    sys.modules['sqlite3'] = sys.modules.pop('pysqlite3')
except ImportError:
    pass

from django.core.wsgi import get_wsgi_application

# Add the project root to the python path so Vercel can find the 'backend' folder
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

application = get_wsgi_application()
app = application
