from django.db import models

# Create your models here.

class Adoptante(models.Model):
    nombre = models.CharField(max_length=50)
    cedula = models.CharField(max_length=20, unique=True)
    correo = models.EmailField(unique=True)
    telefono = models.CharField(max_length=15, blank=True)
    direccion = models.TextField(blank=True)

    def __str__(self):
        return f"{self.nombre} ({self.cedula})"