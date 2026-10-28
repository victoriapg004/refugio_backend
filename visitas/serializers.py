from django.utils import timezone
from rest_framework import serializers
from .models import Visita


class VisitaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visita
        fields = '__all__'

    def validate(self,attrs):
        instancia = self.instance
        solicitud = attrs.get('solicitud', getattr(instancia, 'solicitud' ,None))
        fecha_hora = attrs.get('fecha_hora', getattr(instancia, 'fecha_hora', None))
        estado = attrs.get('estado', getattr(instancia, 'estado', 'programada'))

        #R7: No se puede crear una visita para una solicitud rechazada
        if instancia is None or solicitud != instancia.solicitud:
            if solicitud and solicitud.estado == 'rechazada':
                raise serializers.ValidationError({'solicitud':'No se puede agendar una visita para una solicitud rechazada'})

        #R5: No se puede agendar una visita en el pasado 
        fecha_cambio = instancia is None or fecha_hora != instancia.fecha_hora
        if estado == 'programada' and fecha_cambio and fecha_hora < timezone.now():
            raise serializers.ValidationError({'fecha_hora':'No se puede agendar una visita en el pasado'})

        #R6: No se puede haber dos visitas programadas a la misma fecha y hora
        if estado == 'programada':
            choques  = Visita.objects.filter(fecha_hora=fecha_hora, estado='programada')
            if instancia:
                choques = choques.exclude(pk=instancia.pk)
            if choques.exists():
                raise serializers.ValidationError({'fecha_hora':'Ya existe una visita programada a esa fecha y hora'})

        return attrs