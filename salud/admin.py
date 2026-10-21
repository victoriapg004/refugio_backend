from django.contrib import admin
from .models import Vacuna, RegistroVacunacion

@admin.register(Vacuna)
class VacunaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'descripcion')
    search_fields = ('nombre',)

@admin.register(RegistroVacunacion)
class RegistroVacunacionAdmin(admin.ModelAdmin):
    list_display = ('mascota', 'vacuna', 'fecha_aplicacion')
    list_filter = ('vacuna',)
    search_fields = ('mascota__nombre', 'vacuna__nombre')