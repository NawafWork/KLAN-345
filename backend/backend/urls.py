from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.jwt')),
    
    re_path(r'^.*', TemplateView.as_view(template_name='index.html'), name='index'),
]

# urlpatterns = [
#     path("admin/", admin.site.urls),
#     path("api/user/register/", CreateUserView.as_view(), name="register"),
#     path("api/token/", TokenObtainPairView.as_view(), name="get_token"),
#     path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
#     path("api-auth/", include("rest_framework.urls")),
#     path("api/", include("api.urls")),
# ]
