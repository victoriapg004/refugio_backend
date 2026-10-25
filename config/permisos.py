from rest_framework import status
from rest_framework.response import Response

def verificar_permiso(user, metodo):

    #(GET) es libre para todos
    if metodo == 'GET':
        return None

    #Si no esta autenticado, responde con un 401
    if not user.is_authenticated:
        return Response({'detail': 'Debe autenticarse para realizar esta accion.'}, status=status.HTTP_401_UNAUTHORIZED)

    #Si es admin, tiene acceso a todo
    if user.is_staff:
        return None

    #Si es operador y existe , puede acceder
    es_operador = user.groups.filter(name='Operador').exists()
    if es_operador and metodo in ['POST','PUT','PATCH']:
        return None

    #Y para todo lo demas respondemos con un 403
    return Response({'detail': 'No tiene permisos para realizar esta accion.'}, status=status.HTTP_403_FORBIDDEN)