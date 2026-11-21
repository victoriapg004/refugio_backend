from rest_framework import serializers
from .models import Mascota


class MascotaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mascota
        fields = '__all__'
        read_only_fields = ['fecha_ingreso']

    #R9:La edad (en meses) debe ser mayor que 0 
    def validate_edad(self, value):
        if value <=0:
            raise serializers.ValidationError('La edad debe ser mayor que 0 meses')
        if value >360:
            raise serializers.ValidationError('La edad no puede superar los 360 meses (30 años).')
        return value

    #R12: una mascota solo pasa a adoptada al aprobar su solicitud
    #y una mascota adoptada no vuelve a otro estado de forma manual
    def validate_estado(self, value):
        actual = self.instance.estado if self.instance else None
        if value == 'adoptada' and actual != 'adoptada':
            raise serializers.ValidationError(
                'Una mascota solo pasa a "adoptada" cuando se aprueba su solicitud de adopción.'
            )
        if actual == 'adoptada' and value != 'adoptada':
            raise serializers.ValidationError(
                'Una mascota adoptada no puede cambiar de estado manualmente.'
            )
        return value