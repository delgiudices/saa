from rest_framework.serializers import ModelSerializer
from almacen.models import Almacen, Nodo


class AlmacenSerializer(ModelSerializer):

    class Meta:
        fields = ('pk', 'nombre')
        model = Almacen


class NodoSerializer(ModelSerializer):

    class Meta:
        fields = ('almacen', 'tipo', 'articulos')
        model = Nodo
