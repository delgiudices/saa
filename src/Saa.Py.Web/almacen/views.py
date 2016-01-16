from almacen.serializers import(
    AlmacenSerializer, NodoSerializer, ArticuloSerializer, RobotSerializer,
    CaminoSerializer, Nodo_ArticuloSerializer, ViajeSerializer)
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from almacen.models import(
    Almacen, Nodo, Articulo, Robot, Camino, Nodo_Articulo, Viaje,
    ArticuloViaje)

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


class ViajeViewSet(ModelViewSet):

    def create(self, request, *args, **kwargs):
        almacen = Almacen.objects.all()[0]
        viaje = Viaje.objects.create(almacen=almacen)
        for item in self.request.data['articulos']:
            ArticuloViaje.objects.create(
                viaje=viaje, tipo=item['tipo'], cantidad=item['cantidad'],
                articulo_id=item['pk'])

        arr = [
            {'pk': articulo.articulo.pk} for articulo in
            ArticuloViaje.objects.filter(viaje=viaje)]
        nodo_entrada = Nodo.objects.filter(tipo='entrada')[0]
        viaje.calculate_path(nodo_entrada.pk, arr)
        serializer = self.get_serializer(viaje)
        return Response(serializer.data)

    serializer_class = ViajeSerializer
    queryset = Viaje.objects.all()
