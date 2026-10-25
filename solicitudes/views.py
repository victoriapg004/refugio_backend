from config.permisos import verificar_permiso

from django.db.models import ProtectedError
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import SolicitudAdopcion
from .serializers import SolicitudAdopcionSerializer


@api_view(['GET', 'POST'])
def solicitudes_api(request):
    if request.method == 'GET':
        solicitudes = SolicitudAdopcion.objects.select_related('adoptante', 'mascota').order_by('-fecha', '-id')
        serializer = SolicitudAdopcionSerializer(solicitudes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    error = verificar_permiso(request.user, request.method)
    if error:
        return error

    serializer = SolicitudAdopcionSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def solicitud_detalle_api(request, id):
    try:
        solicitud = SolicitudAdopcion.objects.select_related('adoptante', 'mascota').get(id=id)
    except SolicitudAdopcion.DoesNotExist:
        return Response({'error': 'Solicitud no encontrada.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(SolicitudAdopcionSerializer(solicitud).data)

    error = verificar_permiso(request.user, request.method)
    if error:
        return error

    if request.method in ['PUT', 'PATCH']:
        serializer = SolicitudAdopcionSerializer(solicitud, data=request.data, partial=(request.method == 'PATCH'))
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        solicitud.delete()
    except ProtectedError:
        return Response(
            {'error': 'No se puede eliminar: la solicitud tiene visitas registradas.'},
            status=status.HTTP_409_CONFLICT
        )
    return Response(status=status.HTTP_204_NO_CONTENT)