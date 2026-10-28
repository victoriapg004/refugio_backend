from django.test import TestCase


from adoptantes.models import Adoptante
from config.base_tests import BaseAPITestCase
from solicitudes.models import SolicitudAdopcion
from .models import Mascota


class MascotaTests(BaseAPITestCase):

    def crear_mascota(self, nombre='Luna', especie='gato', edad=12, estado='disponible'):
        return Mascota.objects.create(nombre=nombre, especie=especie, edad=edad, estado=estado)

    # ---------- CRUD (5 pruebas) ----------
    def test_crud_crear_mascota(self):
        self.como(self.operador)
        r = self.client.post('/api/mascotas/', {'nombre': 'Luna', 'especie': 'gato', 'edad': 12}, format='json')
        self.assertEqual(r.status_code, 201)
        self.assertEqual(Mascota.objects.count(), 1)

    def test_crud_listar_mascotas(self):
        self.crear_mascota('Luna')
        self.crear_mascota('Rex', 'perro')
        r = self.client.get('/api/mascotas/')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data['total_registros'], 2)
        self.assertEqual(len(r.data['resultados']), 2)

    def test_crud_detalle_mascota(self):
        m = self.crear_mascota('Luna')
        r = self.client.get(f'/api/mascotas/{m.id}/')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data['nombre'], 'Luna')

    def test_crud_actualizar_mascota_con_patch(self):
        m = self.crear_mascota()
        self.como(self.operador)
        r = self.client.patch(f'/api/mascotas/{m.id}/', {'descripcion': 'Muy cariñosa'}, format='json')
        self.assertEqual(r.status_code, 200)
        m.refresh_from_db()
        self.assertEqual(m.descripcion, 'Muy cariñosa')

    def test_crud_eliminar_mascota(self):
        m = self.crear_mascota()
        self.como(self.admin)
        r = self.client.delete(f'/api/mascotas/{m.id}/')
        self.assertEqual(r.status_code, 204)
        self.assertEqual(Mascota.objects.count(), 0)

    # ---------- Errores HTTP ----------
    def test_eliminar_mascota_con_solicitudes_da_409(self):
        m = self.crear_mascota()
        a = Adoptante.objects.create(nombre='Ana', cedula='1-1111-1111', correo='ana@test.com')
        SolicitudAdopcion.objects.create(adoptante=a, mascota=m)
        self.como(self.admin)
        r = self.client.delete(f'/api/mascotas/{m.id}/')
        self.assertEqual(r.status_code, 409)

    def test_detalle_inexistente_da_404(self):
        r = self.client.get('/api/mascotas/9999/')
        self.assertEqual(r.status_code, 404)

    # ---------- Permisos (3 pruebas) ----------
    def test_permiso_sin_token_da_401(self):
        r = self.client.post('/api/mascotas/', {'nombre': 'Luna', 'especie': 'gato', 'edad': 12}, format='json')
        self.assertEqual(r.status_code, 401)

    def test_permiso_consulta_da_403(self):
        self.como(self.consulta)
        r = self.client.post('/api/mascotas/', {'nombre': 'Luna', 'especie': 'gato', 'edad': 12}, format='json')
        self.assertEqual(r.status_code, 403)

    def test_permiso_operador_no_puede_borrar(self):
        m = self.crear_mascota()
        self.como(self.operador)
        r = self.client.delete(f'/api/mascotas/{m.id}/')
        self.assertEqual(r.status_code, 403)
        self.assertEqual(Mascota.objects.count(), 1)

    # ---------- Paginación y filtros ----------
    def test_paginacion_cinco_por_pagina(self):
        for i in range(7):
            self.crear_mascota(nombre=f'Mascota{i}')
        r = self.client.get('/api/mascotas/')
        self.assertEqual(len(r.data['resultados']), 5)
        self.assertEqual(r.data['total_paginas'], 2)
        self.assertEqual(r.data['total_registros'], 7)
        r2 = self.client.get('/api/mascotas/?pagina=2')
        self.assertEqual(len(r2.data['resultados']), 2)

    def test_filtros_combinados_especie_y_estado(self):
        self.crear_mascota('A', 'gato', estado='disponible')
        self.crear_mascota('B', 'gato', estado='adoptada')
        self.crear_mascota('C', 'perro', estado='disponible')
        r = self.client.get('/api/mascotas/?especie=gato&estado=disponible')
        self.assertEqual(r.data['total_registros'], 1)
        self.assertEqual(r.data['resultados'][0]['nombre'], 'A')

    def test_orden_invalido_da_400(self):
        r = self.client.get('/api/mascotas/?orden=color')
        self.assertEqual(r.status_code, 400)

    # ---------- Regla de negocio ----------
    def test_regla_edad_cero_da_400(self):
        self.como(self.operador)
        r = self.client.post('/api/mascotas/', {'nombre': 'Test', 'especie': 'gato', 'edad': 0}, format='json')
        self.assertEqual(r.status_code, 400)
        self.assertIn('edad', r.data)