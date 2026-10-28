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