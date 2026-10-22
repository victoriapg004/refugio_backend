from django.db import models


class SolicitudAdopcion(models.Model):
    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('aprobada', 'Aprobada'),
        ('rechazada', 'Rechazada'),
    ]

    adoptante = models.ForeignKey(
        'adoptantes.Adoptante',
        on_delete=models.PROTECT,
        related_name='solicitudes',
    )
    mascota = models.ForeignKey(
        'mascotas.Mascota',
        on_delete=models.PROTECT,
        related_name='solicitudes',
    )
    fecha = models.DateField(auto_now_add=True)
    estado = models.CharField(max_length=15, choices=ESTADOS, default='pendiente')
    motivo = models.TextField(blank=True)

    def __str__(self):
        return f"{self.adoptante} - {self.mascota}"