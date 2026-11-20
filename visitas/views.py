from django.shortcuts import render

# Create your views here.
from config.permisos import verificar_permiso

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Visita
from .serializers import VisitaSerializer


@api_view(['GET', 'POST'])
def visitas_api(request):
    if request.method == 'GET':
        visitas = Visita.objects.select_related(
            'solicitud__adoptante', 'solicitud__mascota'
        ).order_by('fecha_hora')

        solicitud = request.query_params.get('solicitud')

        if solicitud is not None:
            if not solicitud.isdecimal() or int(solicitud) <= 0:
                return Response(
                    {'error': 'El parámetro solicitud debe ser un id válido.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            visitas = visitas.filter(solicitud_id=int(solicitud))

        serializer = VisitaSerializer(visitas, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    error = verificar_permiso(request.user, request.method)
    if error:
        return error

    serializer = VisitaSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def visita_detalle_api(request, id):
    try:
        visita = Visita.objects.select_related(
            'solicitud__adoptante', 'solicitud__mascota'
        ).get(id=id)
    except Visita.DoesNotExist:
        return Response({'error': 'Visita no encontrada.'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        visitas = Visita.objects.select_related(
            'solicitud__adoptante', 'solicitud__mascota'
        ).order_by('fecha_hora')

        solicitud = request.query_params.get('solicitud')

        if solicitud is not None:
            if not solicitud.isdecimal() or int(solicitud) <= 0:
                return Response(
                    {'error': 'El parámetro solicitud debe ser un id válido.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            visitas = visitas.filter(solicitud_id=int(solicitud))

        serializer = VisitaSerializer(visitas, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    if request.method in ['PUT', 'PATCH']:
        serializer = VisitaSerializer(visita, data=request.data, partial=(request.method == 'PATCH'))
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    visita.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
