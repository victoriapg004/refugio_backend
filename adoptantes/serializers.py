from rest_framework import serializers
from .models import Adoptante


class AdoptanteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Adoptante
        fields = '__all__'