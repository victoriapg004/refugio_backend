from django.db import models


class Visita(models.Model):
    ESTADOS = [
        ('programada', 'Programada'),
        ('realizada', 'Realizada'),
        ('cancelada', 'Cancelada'),
    ]

    solicitud = models.ForeignKey(
        'solicitudes.SolicitudAdopcion',
        on_delete=models.PROTECT,
        related_name='visitas',
    )
    fecha_hora = models.DateTimeField()
    estado = models.CharField(max_length=15, choices=ESTADOS, default='programada')
    observaciones = models.TextField(blank=True)

    def __str__(self):
        return f"Visita {self.fecha_hora:%d/%m/%Y %H:%M} - {self.solicitud}"