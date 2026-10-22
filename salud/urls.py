from django.urls import path
from . import views

urlpatterns = [
    path('vacunas/', views.vacunas_api, name='api_vacunas'),
    path('vacunas/<int:id>/', views.vacuna_detalle_api, name='vacuna_detalle_api'),
    path('registros/', views.registros_api, name='api_registros'),
    path('registros/<int:id>/', views.registro_detalle_api, name='registro_detalle_api'),
]