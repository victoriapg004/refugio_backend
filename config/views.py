from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from adoptantes.models import Adoptante
from mascotas.models import Mascota
from salud.models import Vacuna
from visitas.models import Visita


@api_view(['GET'])
def estadisticas_api(request):
    # Solo usuarios autenticados pueden ver las estadísticas
    if not request.user.is_authenticated:
        return Response(
            {'detail': 'Debe autenticarse para ver las estadísticas.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    # Consulta 1 : mascotas disponibles por especie
    disponibles_por_especie = list(
        Mascota.objects.filter(estado='disponible')
        .values('especie')
        .annotate(total=Count('id'))
        .order_by('especie')
    )

    # Consulta 2 : mascota con más solicitudes
    top = (
        Mascota.objects
        .annotate(total_solicitudes=Count('solicitudes'))
        .filter(total_solicitudes__gt=0)
        .order_by('-total_solicitudes', 'nombre')
        .first()
    )
    mascota_con_mas_solicitudes = None
    if top:
        mascota_con_mas_solicitudes = {
            'id': top.id,
            'nombre': top.nombre,
            'total_solicitudes': top.total_solicitudes,
        }

    # Consulta 3 : adoptantes con solicitudes aprobadas
    adoptantes = (
        Adoptante.objects
        .annotate(aprobadas=Count('solicitudes', filter=Q(solicitudes__estado='aprobada')))
        .filter(aprobadas__gt=0)
        .order_by('-aprobadas', 'nombre')
    )
    adoptantes_con_aprobadas = [
        {'id': a.id, 'nombre': a.nombre, 'solicitudes_aprobadas': a.aprobadas}
        for a in adoptantes
    ]

    # Consulta 4 : vacunas más aplicadas
    vacunas = (
        Vacuna.objects
        .annotate(total_aplicaciones=Count('registros'))
        .order_by('-total_aplicaciones', 'nombre')[:5]
    )
    vacunas_mas_aplicadas = [
        {'id': v.id, 'nombre': v.nombre, 'total_aplicaciones': v.total_aplicaciones}
        for v in vacunas
    ]

    # Consulta 5 : próximas visitas
    visitas = (
        Visita.objects
        .select_related('solicitud__adoptante', 'solicitud__mascota')
        .filter(
            estado='programada',
            fecha_hora__gte=timezone.now(),
            solicitud__estado='pendiente',
        )
        .order_by('fecha_hora')[:5]
    )
    proximas_visitas = [
        {
            'id': v.id,
            'fecha_hora': v.fecha_hora,
            'adoptante': v.solicitud.adoptante.nombre,
            'mascota': v.solicitud.mascota.nombre,
        }
        for v in visitas
    ]

    # Consulta 6 : mascotas con sus vacunas aplicadas
    mascotas = (
        Mascota.objects
        .prefetch_related('vacunaciones__vacuna')
        .filter(vacunaciones__isnull=False)
        .distinct()
        .order_by('nombre')[:5]
    )
    mascotas_con_vacunas = [
        {'mascota': m.nombre, 'vacunas': [r.vacuna.nombre for r in m.vacunaciones.all()]}
        for m in mascotas
    ]

    return Response({
        'mascotas_disponibles_por_especie': disponibles_por_especie,
        'mascota_con_mas_solicitudes': mascota_con_mas_solicitudes,
        'adoptantes_con_solicitudes_aprobadas': adoptantes_con_aprobadas,
        'vacunas_mas_aplicadas': vacunas_mas_aplicadas,
        'proximas_visitas': proximas_visitas,
        'mascotas_con_sus_vacunas': mascotas_con_vacunas,
    }, status=status.HTTP_200_OK)