from django.contrib.auth.models import Group, User
from rest_framework.test import APITestCase


class BaseAPITestCase(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user('admin_test', password='x', is_staff=True)
        self.operador = User.objects.create_user('operador_test', password='x')
        grupo, _ = Group.objects.get_or_create(name='Operador')
        self.operador.groups.add(grupo)
        self.consulta = User.objects.create_user('consulta_test', password='x')

    def como(self, usuario):
        self.client.force_authenticate(user=usuario)