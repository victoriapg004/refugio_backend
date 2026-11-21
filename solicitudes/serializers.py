from rest_framework import serializers
from .models import SolicitudAdopcion

def sincronizar_estado_mascota(mascota):
    """R13: la mascota está "en_proceso" solo con solicitudes pendientes
    y vuelve a "disponible" cuando ya no le queda ninguna. """
    if mascota.estado == 'adoptada':
        return
    hay_pendientes = mascota.solicitudes.filter(estado='pendiente').exists()
    nuevo_estado = 'en_proceso' if hay_pendientes else 'disponible'
    if mascota.estado != nuevo_estado:
        mascota.estado = nuevo_estado
        mascota.save(update_fields=['estado'])


class SolicitudAdopcionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SolicitudAdopcion
        fields = '__all__'
        read_only_fields = ['fecha']

    def validate(self, attrs):
        instancia = self.instance
        mascota = attrs.get('mascota', getattr(instancia, 'mascota', None))
        adoptante = attrs.get('adoptante', getattr(instancia, 'adoptante', None))
        estado = attrs.get('estado', getattr(instancia, 'estado', 'pendiente'))

        #R11: una solicitud aprobada o rechazada ya no se puede modificar
        if instancia is not None and instancia.estado in ('aprobada', 'rechazada'):
            raise serializers.ValidationError('Una solicitud aprobada o rechazada ya no se puede modificar.')

        #R1: No se puede solicitar una mascota ya adoptada
        if instancia is None or mascota != instancia.mascota:
            if mascota and mascota.estado == 'adoptada':
                raise serializers.ValidationError({'mascota': 'No se puede solicitar una mascota ya adoptada.'})

        #R4: Un adoptante no puede tener dos solicitudes pendientes por la misma mascota
        if estado == 'pendiente' and adoptante and mascota:
            duplicadas = SolicitudAdopcion.objects.filter(adoptante=adoptante, mascota=mascota, estado='pendiente')
            if instancia:
                duplicadas = duplicadas.exclude(pk=instancia.pk)
            if duplicadas.exists():
                raise serializers.ValidationError('Este adoptante ya tiene una solicitud pendiente para esta mascota.')

        if estado == 'aprobada':
            #R2:Para aprobar  que debe existir al menos una visita realizada
            if instancia is None or instancia.estado != 'aprobada':
                 if instancia is None or not instancia.visitas.filter(estado='realizada').exists():
                     raise serializers.ValidationError({'estado':'No se puede aprobar una solicitud sin al menos una visita realizada.'})
                 
            #R3: Una mascota no puede tener dos solicitudes aprobadas
            if mascota:
                otras = SolicitudAdopcion.objects.filter(mascota=mascota, estado='aprobada')
                if instancia:
                    otras = otras.exclude(pk=instancia.pk)
                if otras.exists():
                    raise serializers.ValidationError(
                        {'estado':'Esta mascota ya tiene una solicitud aprobada'}
                    )
        return attrs

    #R13: al crear una solicitud, la mascota pasa a "en_proceso"
    def create(self, validated_data):
        solicitud = super().create(validated_data)
        sincronizar_estado_mascota(solicitud.mascota)
        return solicitud

    #R10: Al aprobar una solicitud, la mascota pasa a "adoptada"
    #R13: si se rechaza o se cambia de mascota, se vuelve a calcular el estado
    def update(self, instance, validated_data):
        mascota_anterior = instance.mascota
        solicitud = super().update(instance, validated_data)
        if solicitud.estado == 'aprobada':
            solicitud.mascota.estado = 'adoptada'
            solicitud.mascota.save()
        else:
            sincronizar_estado_mascota(solicitud.mascota)
        if mascota_anterior != solicitud.mascota:
            sincronizar_estado_mascota(mascota_anterior)
        return solicitud