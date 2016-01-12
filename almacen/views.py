from almacen.serializers import AlmacenSerializer, NodoSerializer
from rest_framework.viewsets import ModelViewSet
from almacen.models import Almacen, Nodo

# Create your views here.


class AlmacenViewSet(ModelViewSet):

    serializer_class = AlmacenSerializer
    queryset = Almacen.objects.all()


class NodoViewSet(ModelViewSet):

    serializer_class = NodoSerializer
    queryset = Nodo.objects.all()
