from datetime import timedelta

from django.utils import timezone

from adoptantes.models import Adoptante
from config.base_tests import BaseAPITestCase
from mascotas.models import Mascota
from solicitudes.models import SolicitudAdopcion
from .models import Visita


class VisitaReglasTests(BaseAPITestCase):

    def setUp(self):
        super().setUp()
        adoptante = Adoptante.objects.create(nombre='Ana', cedula='1-1111-1111', correo='ana@test.com')
        mascota = Mascota.objects.create(nombre='Luna', especie='gato', edad=12)
        self.solicitud = SolicitudAdopcion.objects.create(adoptante=adoptante, mascota=mascota)
        self.futuro = (timezone.now() + timedelta(days=5)).replace(microsecond=0).isoformat()
        self.como(self.operador)

    def test_regla5_no_visita_en_el_pasado(self):
        r = self.client.post('/api/visitas/', {
            'solicitud': self.solicitud.id, 'fecha_hora': '2020-01-01T10:00:00Z'
        }, format='json')
        self.assertEqual(r.status_code, 400)
        self.assertIn('fecha_hora', r.data)

    def test_regla6_no_dos_visitas_a_la_misma_hora(self):
        datos = {'solicitud': self.solicitud.id, 'fecha_hora': self.futuro}
        r1 = self.client.post('/api/visitas/', datos, format='json')
        self.assertEqual(r1.status_code, 201)
        r2 = self.client.post('/api/visitas/', datos, format='json')
        self.assertEqual(r2.status_code, 400)

    def test_regla7_no_visita_para_solicitud_rechazada(self):
        self.solicitud.estado = 'rechazada'
        self.solicitud.save()
        r = self.client.post('/api/visitas/', {
            'solicitud': self.solicitud.id, 'fecha_hora': self.futuro
        }, format='json')
        self.assertEqual(r.status_code, 400)
    
    def test_visitas_filtradas_por_solicitud(self):
        otra_mascota = Mascota.objects.create(nombre='Milo',especie='gato',edad=6)
        otra_solicitud = SolicitudAdopcion.objects.create(adoptante=self.solicitud.adoptante,mascota=otra_mascota)

        Visita.objects.create(solicitud=self.solicitud,fecha_hora=timezone.now() + timedelta(days=3))

        Visita.objects.create(solicitud=otra_solicitud,fecha_hora=timezone.now() + timedelta(days=4))

        respuesta = self.client.get(f'/api/visitas/?solicitud={self.solicitud.id}')

        self.assertEqual(respuesta.status_code, 200)
        self.assertEqual(len(respuesta.data), 1)
        self.assertEqual(respuesta.data[0]['solicitud'],self.solicitud.id)

        invalida = self.client.get('/api/visitas/?solicitud=abc')
        self.assertEqual(invalida.status_code, 400)
    
    def test_detalle_visita_y_permisos(self):
        visita = Visita.objects.create(
            solicitud=self.solicitud,
            fecha_hora=timezone.now() + timedelta(days=3)
        )

        url = f'/api/visitas/{visita.id}/'

        respuesta = self.client.get(url)
        self.assertEqual(respuesta.status_code, 200)
        self.assertEqual(respuesta.data['id'], visita.id)

        self.como(self.consulta)
        respuesta = self.client.patch(
            url, {'observaciones': 'Prueba'}, format='json')
        self.assertEqual(respuesta.status_code, 403)

        self.client.force_authenticate(user=None)
        respuesta = self.client.patch(
            url, {'observaciones': 'Prueba'}, format='json')
        self.assertEqual(respuesta.status_code, 401)

        self.como(self.operador)
        respuesta = self.client.patch(
            url, {'observaciones': 'Visita actualizada'}, format='json')
        self.assertEqual(respuesta.status_code, 200)

        respuesta = self.client.delete(url)
        self.assertEqual(respuesta.status_code, 403)

        self.como(self.admin)
        respuesta = self.client.delete(url)
        self.assertEqual(respuesta.status_code, 204)
