from rest_framework.serializers import ModelSerializer
from almacen.models import Almacen, Nodo, Articulo, Robot, Camino


class AlmacenSerializer(ModelSerializer):

    class Meta:
        fields = ('pk', 'nombre')
        model = Almacen


class NodoSerializer(ModelSerializer):

    class Meta:
        fields = ('pk', 'almacen', 'tipo', 'articulos', 'nodos')
        model = Nodo


class ArticuloSerializer(ModelSerializer):

    class Meta:
        fields = ('pk', 'nombre')
        model = Articulo


class RobotSerializer(ModelSerializer):

    class Meta:
        fields = ('pk', 'nombre', 'estado')
        model = Robot


class CaminoSerializer(ModelSerializer):

    class Meta:
        fields = ('pk', 'desde', 'hasta', 'distancia')
        model = Camino
