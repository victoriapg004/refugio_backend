from django.db import models

# Create your models here.

class Mascota(models.Model):
    ESPECIES = [
        ('perro', 'Perro'),
        ('gato', 'Gato'),
    ]
    ESTADOS = [
        ('disponible', 'Disponible'),
        ('en_proceso', 'En proceso'),
        ('adoptada', 'Adoptada'),
    ]

    nombre = models.CharField(max_length=100)
    especie = models.CharField(max_length=10, choices=ESPECIES)
    raza = models.CharField(max_length=100, blank=True)
    edad = models.PositiveIntegerField(help_text="Edad en meses")
    descripcion = models.TextField(blank=True)
    estado = models.CharField(max_length=15, choices=ESTADOS, default='disponible')
    fecha_ingreso = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.nombre} ({self.especie})"

    