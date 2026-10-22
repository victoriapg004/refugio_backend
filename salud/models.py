from django.db import models

class Vacuna(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True)

    def __str__(self):
        return self.nombre

class RegistroVacunacion(models.Model):
    mascota = models.ForeignKey(
        'mascotas.Mascota',
        on_delete=models.PROTECT,
        related_name='vacunaciones',
    )
    vacuna = models.ForeignKey(
        Vacuna,
        on_delete=models.PROTECT,
        related_name='registros',
    )
    fecha_aplicacion = models.DateField()
    observaciones = models.TextField(blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['mascota', 'vacuna', 'fecha_aplicacion'],
                name='registro_vacunacion_unico',
            )
        ]

    def __str__(self):
        return f"{self.mascota.nombre} - {self.vacuna.nombre} ({self.fecha_aplicacion})"