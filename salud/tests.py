from datetime import date, timedelta

from config.base_tests import BaseAPITestCase
from mascotas.models import Mascota
from salud.models import Vacuna, RegistroVacunacion


class SaludTests(BaseAPITestCase):
    def test_vacuna_nombre_duplicado_400(self):
        Vacuna.objects.create(nombre='Rabia')
        self.como(self.operador)
        respuesta = self.client.post('/api/salud/vacunas/', {'nombre': 'Rabia'}, format='json')
        self.assertEqual(respuesta.status_code, 400)
        self.assertIn('nombre', respuesta.data)

    def test_registro_fecha_futura_400(self):
        mascota = Mascota.objects.create(nombre='Luna', especie='gato', edad=12)
        vacuna = Vacuna.objects.create(nombre='Rabia')
        self.como(self.operador)
        datos = {
            'mascota': mascota.id,
            'vacuna': vacuna.id,
            'fecha_aplicacion': (date.today() + timedelta(days=1)).isoformat(),
        }
        respuesta = self.client.post('/api/salud/registros/', datos, format='json')
        self.assertEqual(respuesta.status_code, 400)
        self.assertIn('fecha_aplicacion', respuesta.data)

    def test_registro_duplicado_400(self):
        mascota = Mascota.objects.create(nombre='Luna', especie='gato', edad=12)
        vacuna = Vacuna.objects.create(nombre='Rabia')
        RegistroVacunacion.objects.create(mascota=mascota, vacuna=vacuna, fecha_aplicacion=date.today())
        self.como(self.operador)
        datos = {'mascota': mascota.id, 'vacuna': vacuna.id, 'fecha_aplicacion': date.today().isoformat()}
        respuesta = self.client.post('/api/salud/registros/', datos, format='json')
        self.assertEqual(respuesta.status_code, 400)
        self.assertEqual(RegistroVacunacion.objects.count(), 1)
