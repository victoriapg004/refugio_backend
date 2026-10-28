from adoptantes.models import Adoptante
from config.base_tests import BaseAPITestCase
from mascotas.models import Mascota
from solicitudes.models import SolicitudAdopcion


class AdoptanteTests(BaseAPITestCase):
    def test_crear_adoptante_201(self):
        self.como(self.operador)
        datos = {'nombre': 'Ana', 'cedula': '1-1111-1111', 'correo': 'ana@test.com'}
        respuesta = self.client.post('/api/adoptantes/', datos, format='json')
        self.assertEqual(respuesta.status_code, 201)
        self.assertEqual(Adoptante.objects.count(), 1)

    def test_cedula_duplicada_400(self):
        Adoptante.objects.create(nombre='Ana', cedula='1-1111-1111', correo='ana@test.com')
        self.como(self.operador)
        datos = {'nombre': 'Carlos', 'cedula': '1-1111-1111', 'correo': 'carlos@test.com'}
        respuesta = self.client.post('/api/adoptantes/', datos, format='json')
        self.assertEqual(respuesta.status_code, 400)
        self.assertIn('cedula', respuesta.data)

    def test_eliminar_con_solicitudes_409(self):
        adoptante = Adoptante.objects.create(nombre='Ana', cedula='1-1111-1111', correo='ana@test.com')
        mascota = Mascota.objects.create(nombre='Luna', especie='gato', edad=12)
        SolicitudAdopcion.objects.create(adoptante=adoptante, mascota=mascota)
        self.como(self.admin)
        respuesta = self.client.delete(f'/api/adoptantes/{adoptante.id}/')
        self.assertEqual(respuesta.status_code, 409)
        self.assertTrue(Adoptante.objects.filter(pk=adoptante.pk).exists())
