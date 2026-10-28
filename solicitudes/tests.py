from datetime import timedelta

from django.utils import timezone

from adoptantes.models import Adoptante
from config.base_tests import BaseAPITestCase
from mascotas.models import Mascota
from visitas.models import Visita
from .models import SolicitudAdopcion


class SolicitudReglasTests(BaseAPITestCase):

    def setUp(self):
        super().setUp()
        self.adoptante = Adoptante.objects.create(nombre='Ana', cedula='1-1111-1111', correo='ana@test.com')
        self.mascota = Mascota.objects.create(nombre='Luna', especie='gato', edad=12)
        self.adoptada = Mascota.objects.create(nombre='Rex', especie='perro', edad=24, estado='adoptada')
        self.como(self.operador)

    def test_regla1_no_solicitar_mascota_adoptada(self):
        r = self.client.post('/api/solicitudes/', {
            'adoptante': self.adoptante.id, 'mascota': self.adoptada.id, 'motivo': 'x'
        }, format='json')
        self.assertEqual(r.status_code, 400)
        self.assertIn('mascota', r.data)

    def test_regla1_protegida_tambien_en_patch(self):
        sol = SolicitudAdopcion.objects.create(adoptante=self.adoptante, mascota=self.mascota)
        r = self.client.patch(f'/api/solicitudes/{sol.id}/', {'mascota': self.adoptada.id}, format='json')
        self.assertEqual(r.status_code, 400)

    def test_regla4_no_dos_pendientes_misma_mascota(self):
        datos = {'adoptante': self.adoptante.id, 'mascota': self.mascota.id, 'motivo': 'x'}
        r1 = self.client.post('/api/solicitudes/', datos, format='json')
        self.assertEqual(r1.status_code, 201)
        r2 = self.client.post('/api/solicitudes/', datos, format='json')
        self.assertEqual(r2.status_code, 400)

    def test_regla2_no_aprobar_sin_visita_realizada(self):
        sol = SolicitudAdopcion.objects.create(adoptante=self.adoptante, mascota=self.mascota)
        r = self.client.patch(f'/api/solicitudes/{sol.id}/', {'estado': 'aprobada'}, format='json')
        self.assertEqual(r.status_code, 400)

    def test_regla10_aprobar_con_visita_realizada_marca_mascota_adoptada(self):
        sol = SolicitudAdopcion.objects.create(adoptante=self.adoptante, mascota=self.mascota)
        Visita.objects.create(
            solicitud=sol, fecha_hora=timezone.now() + timedelta(days=1), estado='realizada'
        )
        r = self.client.patch(f'/api/solicitudes/{sol.id}/', {'estado': 'aprobada'}, format='json')
        self.assertEqual(r.status_code, 200)
        self.mascota.refresh_from_db()
        self.assertEqual(self.mascota.estado, 'adoptada')