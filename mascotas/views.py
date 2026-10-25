from django.shortcuts import render

# Create your views here.
from config.permisos import verificar_permiso

from django.db.models import ProtectedError
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Mascota
from .serializers import MascotaSerializer


@api_view(['GET', 'POST'])
def mascotas_api(request):
    if request.method == 'GET':
        mascotas = Mascota.objects.order_by('nombre')
        serializer = MascotaSerializer(mascotas, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    error = verificar_permiso(request.user, request.method)
    if error:
        return error

    serializer = MascotaSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def mascota_detalle_api(request, id):
    try:
        mascota = Mascota.objects.get(id=id)
    except Mascota.DoesNotExist:
        return Response({'error': 'Mascota no encontrada.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(MascotaSerializer(mascota).data)

    error = verificar_permiso(request.user, request.method)
    if error:
        return error

    if request.method in ['PUT', 'PATCH']:
        serializer = MascotaSerializer(mascota, data=request.data, partial=(request.method == 'PATCH'))
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        mascota.delete()
    except ProtectedError:
        return Response(
            {'error': 'No se puede eliminar: la mascota tiene solicitudes o registros de vacunación.'},
            status=status.HTTP_409_CONFLICT
        )
    return Response(status=status.HTTP_204_NO_CONTENT)