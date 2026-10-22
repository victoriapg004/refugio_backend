from django.urls import path
from . import views

urlpatterns = [
    path('', views.mascotas_api, name='api_mascotas'),
    path('<int:id>/', views.mascota_detalle_api, name='mascota_detalle_api'),
]