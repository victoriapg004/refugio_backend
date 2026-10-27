from datetime import date
from rest_framework import serializers
from .models import Vacuna, RegistroVacunacion


class VacunaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vacuna
        fields = '__all__'


class RegistroVacunacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistroVacunacion
        fields = '__all__'

    #R8: La fecha de aplicacion no puede ser futura
    def validate_fecha_aplicacion(self, value):
        if value > date.today():
            raise serializers.ValidationError('La fecha de aplicacion de la vacuna no puede ser futura.')
        return value