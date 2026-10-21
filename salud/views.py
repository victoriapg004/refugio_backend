from django.shortcuts import render

# Create your views here.
from django.db.models import ProtectedError
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Vacuna, RegistroVacunacion
from .serializers import VacunaSerializer, RegistroVacunacionSerializer


@api_view(['GET', 'POST'])
def vacunas_api(request):
    if request.method == 'GET':
        vacunas = Vacuna.objects.order_by('nombre')
        serializer = VacunaSerializer(vacunas, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    if not request.user.is_authenticated or not request.user.is_staff:
        return Response({'detail': 'Se requiere un usuario administrador.'}, status=status.HTTP_403_FORBIDDEN)

    serializer = VacunaSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def vacuna_detalle_api(request, id):
    try:
        vacuna = Vacuna.objects.get(id=id)
    except Vacuna.DoesNotExist:
        return Response({'error': 'Vacuna no encontrada.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(VacunaSerializer(vacuna).data)

    if not request.user.is_authenticated or not request.user.is_staff:
        return Response({'detail': 'Se requiere un usuario administrador.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method in ['PUT', 'PATCH']:
        serializer = VacunaSerializer(vacuna, data=request.data, partial=(request.method == 'PATCH'))
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        vacuna.delete()
    except ProtectedError:
        return Response(
            {'error': 'No se puede eliminar: la vacuna tiene registros de vacunación.'},
            status=status.HTTP_409_CONFLICT
        )
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
def registros_api(request):
    if request.method == 'GET':
        registros = RegistroVacunacion.objects.select_related(
            'mascota', 'vacuna'
        ).order_by('-fecha_aplicacion', '-id')
        serializer = RegistroVacunacionSerializer(registros, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    if not request.user.is_authenticated or not request.user.is_staff:
        return Response({'detail': 'Se requiere un usuario administrador.'}, status=status.HTTP_403_FORBIDDEN)

    serializer = RegistroVacunacionSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def registro_detalle_api(request, id):
    try:
        registro = RegistroVacunacion.objects.select_related('mascota', 'vacuna').get(id=id)
    except RegistroVacunacion.DoesNotExist:
        return Response({'error': 'Registro de vacunación no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(RegistroVacunacionSerializer(registro).data)

    if not request.user.is_authenticated or not request.user.is_staff:
        return Response({'detail': 'Se requiere un usuario administrador.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method in ['PUT', 'PATCH']:
        serializer = RegistroVacunacionSerializer(registro, data=request.data, partial=(request.method == 'PATCH'))
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    registro.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)