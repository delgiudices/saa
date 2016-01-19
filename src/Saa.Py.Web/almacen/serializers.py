from rest_framework.serializers import ModelSerializer
from almacen.models import(
    Almacen, Nodo, Articulo, Robot, Camino, Nodo_Articulo, Viaje)

from rest_framework import serializers
import json


class JSONSerializerField(serializers.Field):
        """ Serializer for JSONField -- required to make field writable"""

        def to_internal_value(self, data):
            return data

        def to_representation(self, value):
            return json.dumps(value)


class AlmacenSerializer(ModelSerializer):

    class Meta:
        fields = ('pk', 'nombre', 'mapa')
        model = Almacen
        depth = 2


class NodoSerializer(ModelSerializer):

    class Meta:
        fields = ('pk', 'nombre', 'almacen', 'tipo', 'articulos', 'nodos', 'x', 'y')
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


class Nodo_ArticuloSerializer(ModelSerializer):

    class Meta:
        fields = ('pk', 'nodo', 'articulo', 'cantidad', 'capacidad')
        model = Nodo_Articulo


class ViajeSerializer(ModelSerializer):

    path = JSONSerializerField()

    class Meta:
        fields = ('pk', 'almacen', 'articulos', 'path')
        model = Viaje
        depth = 2
