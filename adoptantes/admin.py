from django.contrib import admin
from .models import Adoptante

@admin.register(Adoptante)
class AdoptanteAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'cedula', 'correo', 'telefono')
    search_fields = ('nombre', 'cedula', 'correo')