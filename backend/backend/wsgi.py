"""
WSGI config for backend project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""
import os
from django.core.wsgi import get_wsgi_application
from whitenoise import WhiteNoise

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Get the Django WSGI application
application = get_wsgi_application()

# Add WhiteNoise middleware for static file serving
application = WhiteNoise(application)
application.add_files('/path/to/static/', prefix='static/')