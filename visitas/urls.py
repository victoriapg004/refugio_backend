from django.urls import path
from . import views

urlpatterns = [
    path('', views.visitas_api, name='api_visitas'),
    path('<int:id>/', views.visita_detalle_api, name='visita_detalle_api'),
]