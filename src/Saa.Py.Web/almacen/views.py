from almacen.serializers import(
    AlmacenSerializer, NodoSerializer, ArticuloSerializer, RobotSerializer,
    CaminoSerializer, Nodo_ArticuloSerializer)
from rest_framework.viewsets import ModelViewSet
from almacen.models import(
    Almacen, Nodo, Articulo, Robot, Camino, Nodo_Articulo)

# Create your views here.


class AlmacenViewSet(ModelViewSet):

    serializer_class = AlmacenSerializer
    queryset = Almacen.objects.all()


class NodoViewSet(ModelViewSet):

    serializer_class = NodoSerializer
    queryset = Nodo.objects.all()


class ArticuloViewSet(ModelViewSet):

    serializer_class = ArticuloSerializer
    queryset = Articulo.objects.all()


class RobotViewSet(ModelViewSet):

    serializer_class = RobotSerializer
    queryset = Robot.objects.all()


class CaminoViewSet(ModelViewSet):

    serializer_class = CaminoSerializer
    queryset = Camino.objects.all()


class NodoArticuloViewSet(ModelViewSet):

    serializer_class = Nodo_ArticuloSerializer
    queryset = Nodo_Articulo.objects.all()
