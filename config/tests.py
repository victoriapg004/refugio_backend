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