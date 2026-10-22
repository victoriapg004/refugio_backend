from django.contrib import admin
from .models import Visita

@admin.register(Visita)
class VisitaAdmin(admin.ModelAdmin):
    list_display = ('solicitud', 'fecha_hora', 'estado')
    list_filter = ('estado',)
    search_fields = ('solicitud__adoptante__nombre', 'solicitud__mascota__nombre')