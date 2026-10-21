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