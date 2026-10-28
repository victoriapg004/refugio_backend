from django.core.paginator import Paginator
from rest_framework import status
from rest_framework.response import Response

def paginar(queryset, request, serializer_class, por_pagina=5):
    paginator = Paginator(queryset, por_pagina)
    pagina = paginator.get_page(request.query_params.get('pagina',1))

    serializer = serializer_class(pagina.object_list, many=True)
    return Response({
        'pagina_actual': pagina.number,
        'total_paginas': paginator.num_pages,
        'total_registros': paginator.count,
        'resultados': serializer.data
    }, status=status.HTTP_200_OK)