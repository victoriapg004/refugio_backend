from django.contrib import admin
from .models import Mascota

@admin.register(Mascota)
class MascotaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'especie', 'raza', 'edad', 'estado')
    list_filter = ('especie', 'estado')
    search_fields = ('nombre', 'raza')