from config.base_tests import BaseAPITestCase


class EstadisticasTests(BaseAPITestCase):

    def test_estadisticas_sin_token_da_401(self):
        r = self.client.get('/api/estadisticas/')
        self.assertEqual(r.status_code, 401)

    def test_estadisticas_con_usuario_autenticado(self):
        self.como(self.consulta)
        r = self.client.get('/api/estadisticas/')
        self.assertEqual(r.status_code, 200)
        for clave in [
            'mascotas_disponibles_por_especie',
            'mascota_con_mas_solicitudes',
            'adoptantes_con_solicitudes_aprobadas',
            'vacunas_mas_aplicadas',
            'proximas_visitas',
            'mascotas_con_sus_vacunas',
        ]:
            self.assertIn(clave, r.data)

class PerfilTests(BaseAPITestCase):

    def test_perfil_sin_token_da_401(self):
        self.assertEqual(self.client.get('/api/perfil/').status_code, 401)

    def test_perfil_administrador(self):
        self.como(self.admin)
        r = self.client.get('/api/perfil/')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data['rol'], 'administrador')
        self.assertTrue(r.data['puede_borrar'])

    def test_perfil_operador(self):
        self.como(self.operador)
        r = self.client.get('/api/perfil/')
        self.assertEqual(r.data['rol'], 'operador')
        self.assertTrue(r.data['puede_crear'])
        self.assertTrue(r.data['puede_editar'])
        self.assertFalse(r.data['puede_borrar'])

    def test_perfil_consulta(self):
        self.como(self.consulta)
        r = self.client.get('/api/perfil/')
        self.assertEqual(r.data['rol'], 'consulta')
        self.assertFalse(r.data['puede_crear'])
        self.assertFalse(r.data['puede_editar'])
        self.assertFalse(r.data['puede_borrar'])