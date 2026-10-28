from django.shortcuts import render

# Create your views here.
from config.permisos import verificar_permiso
from config.paginacion import paginar

from django.db.models import ProtectedError, Q
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Mascota
from .serializers import MascotaSerializer


@api_view(['GET', 'POST'])
def mascotas_api(request):
    if request.method == 'GET':
        mascotas = Mascota.objects.all()

        #Filtros combinables
        especie = request.query_params.get('especie')
        estado = request.query_params.get('estado')
        if especie:
            mascotas = mascotas.filter(especie=especie)
        if estado:
            mascotas = mascotas.filter(estado=estado)

        #Busqueda por nombre o raza
        buscar = request.query_params.get('buscar')
        if buscar:
            mascotas = mascotas.filter(Q(nombre__icontains=buscar) | Q(raza__icontains=buscar))

        #Ordenamineto (solo los campos permitidos)
        orden = request.query_params.get('orden','nombre')
        campos_permitidos = ['nombre','edad', 'fecha_ingreso']
        if orden.lstrip('-') not in campos_permitidos:
            return Response({'error': 'Orden invalido. '}, status=status.HTTP_400_BAD_REQUEST)
        mascotas = mascotas.order_by(orden, 'id')

        return paginar(mascotas, request, MascotaSerializer)

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