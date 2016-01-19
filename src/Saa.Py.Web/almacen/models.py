from django.db import models
from jsonfield import JSONField
from dijkstar import Graph, find_path


class Almacen(models.Model):

    def __unicode__(self):
        return self.nombre

    nombre = models.CharField(max_length=80)
    mapa = models.ImageField(null=True, blank=True)

    def setUpGraph(self):
        graph = Graph()
        for camino in Camino.objects.all():
            graph.add_edge(
                camino.desde.pk, camino.hasta.pk, {'cost': camino.distancia})
        return graph

    def camino_mas_cercano(self, desde, hasta):
        graph = self.setUpGraph()
        cost_func = lambda u, v, e, prev_e: e['cost']
        path = find_path(graph, desde, hasta, cost_func=cost_func)
        return path


class Nodo(models.Model):

    choices = (
        ('salida', 'Salida'),
        ('entrada', 'Entrada'),
        ('almacen', 'Almacen'),
        ('punto', 'Punto'),
    )

    almacen = models.ForeignKey(Almacen)
    nombre = models.CharField(max_length=80, null=True)
    tipo = models.CharField(choices=choices, max_length=80)
    articulos = models.ManyToManyField('Articulo', through='Nodo_Articulo')
    nodos = models.ManyToManyField('Nodo', through='Camino')
    x = models.IntegerField()
    y = models.IntegerField()

    def __unicode__(self):
        return "%s:%s" % (self.pk, self.tipo)


class Articulo(models.Model):

    def __unicode__(self):
        return self.nombre

    nombre = models.CharField(max_length=80)


class Nodo_Articulo(models.Model):

    nodo = models.ForeignKey(Nodo)
    articulo = models.ForeignKey(Articulo)
    cantidad = models.PositiveIntegerField()
    capacidad = models.PositiveIntegerField()


class Camino(models.Model):

    desde = models.ForeignKey(Nodo, related_name='desde')
    hasta = models.ForeignKey(Nodo, related_name='hasta')
    distancia = models.PositiveIntegerField()

    def __unicode__(self):
        return "%s - %s" % (self.desde.__unicode__(), self.hasta.__unicode__())


class Robot(models.Model):

    choices = (
        ('disponible', 'Disponible'),
        ('marcha', 'En Marcha'),
        ('fuera_de_servicio', 'Fuera de Servicio'),
    )

    nombre = models.CharField(max_length=80)
    estado = models.CharField(max_length=80, choices=choices)


class Viaje(models.Model):

    almacen = models.ForeignKey(Almacen)
    articulos = models.ManyToManyField(Articulo, through='ArticuloViaje')
    path = JSONField(null=True, blank=True)

    def calculate_path(self, start, articulos):
        data = {}
        if len(articulos) == 0:
            self.save()
            return
        for articulo in articulos:
            nodos = Nodo.objects.filter(
                nodo_articulo__articulo_id=articulo['pk'])
            nodo_mas_cercano, peso = nodos[0], self.almacen.camino_mas_cercano(
                start, nodos[0].pk)[3]
            for nodo in nodos:
                now_peso = self.almacen.camino_mas_cercano(start, nodo.pk)
                if now_peso < peso:
                    nodo_mas_cercano = nodo,
                    peso = now_peso
            data[articulo['pk']] = {
                'peso': peso, 'nodo_mas_cercano': nodo_mas_cercano}

        data_items = data.items()
        min_articulo_key, peso = data_items[0][0], data_items[0][1]['peso']
        for articulo_key, articulo_data in data.items():
            if articulo_data['peso'] < peso:
                min_articulo_key = articulo_key
                peso = articulo_data['peso']

        if self.path is None:
            self.path = []
        calculated_path = self.almacen.camino_mas_cercano(
            start, data[min_articulo_key]['nodo_mas_cercano'].pk)
        edges = []
        for key, node_key in enumerate(calculated_path[0]):
            try:
                camino = Camino.objects.get(
                    desde_id=node_key, hasta_id=node_key+1)
                edges.append(camino.pk)
            except:
                pass

        self.path.append({
            'articulo': min_articulo_key, 'camino': calculated_path[0],
            'path': edges})
        new_start = data[min_articulo_key]['nodo_mas_cercano'].pk
        new_articulos = [
            articulo for articulo in articulos
            if articulo['pk'] != min_articulo_key]
        self.calculate_path(new_start, new_articulos)


class ArticuloViaje(models.Model):

    choices = (
        ('entrada', 'Entrada'),
        ('salida', 'Salida'),
    )

    viaje = models.ForeignKey(Viaje)
    articulo = models.ForeignKey(Articulo)
    cantidad = models.PositiveIntegerField()
    tipo = models.CharField(max_length=10, choices=choices)
