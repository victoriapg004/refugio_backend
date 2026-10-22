from django.urls import path
from . import views

urlpatterns = [
    path('', views.adoptantes_api, name='api_adoptantes'),
    path('<int:id>/', views.adoptante_detalle_api, name='adoptante_detalle_api'),
]