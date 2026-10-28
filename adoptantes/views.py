from django.http import request

from config.permisos import verificar_permiso

from django.db.models import ProtectedError
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Adoptante
from .serializers import AdoptanteSerializer


@api_view(['GET', 'POST'])
def adoptantes_api(request):
    if request.method == 'GET':
        adoptantes = Adoptante.objects.order_by('nombre')
        serializer = AdoptanteSerializer(adoptantes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    error = verificar_permiso(request.user, request.method)
    if error:
        return error

    serializer = AdoptanteSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def adoptante_detalle_api(request, id):
    try:
        adoptante = Adoptante.objects.get(id=id)
    except Adoptante.DoesNotExist:
        return Response({'error': 'Adoptante no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(AdoptanteSerializer(adoptante).data)

    error = verificar_permiso(request.user, request.method)
    if error:
        return error

    if request.method in ['PUT', 'PATCH']:
        serializer = AdoptanteSerializer(adoptante, data=request.data, partial=(request.method == 'PATCH'))
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        adoptante.delete()
    except ProtectedError:
        return Response(
            {'error': 'No se puede eliminar: el adoptante tiene solicitudes de adopción.'},
            status=status.HTTP_409_CONFLICT
        )
    return Response(status=status.HTTP_204_NO_CONTENT)