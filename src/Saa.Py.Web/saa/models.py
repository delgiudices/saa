from django.db import models


class Almacen(models.Model):

    def __unicode__(self):
        return self.nombre

    nombre = models.CharField(max_length=80)


class Nodo(models.Model):

    choices = (
        ('salida', 'Salida'),
        ('entrada', 'Entrada'),
        ('almacen', 'Almacen'),
    )

    nombre = models.CharField(max_length=80, null=True),
    almacen = models.ForeignKey(Almacen)
    tipo = models.CharField(choices=choices, max_length=80)
    articulos = models.ManyToManyField('Articulo', through='Nodo_Articulo')
    nodos = models.ManyToManyField('Nodo', through='Camino')


class Articulo(models.Model):

    def __unicode__(self):
        return self.nombre

    nombre = models.CharField(max_length=80)


class Nodo_Articulo(models.Model):

    nodo = models.ForeignKey(Nodo)
    articulo = models.ForeignKey(Articulo)
    cantidad = models.PositiveIntegerField()


class Camino(models.Model):

    desde = models.ForeignKey(Nodo, related_name='desde')
    hasta = models.ForeignKey(Nodo, related_name='hasta')
    distancia = models.PositiveIntegerField()


class Robot(models.Model):

    choices = (
        ('disponible', 'Disponible'),
        ('marcha', 'En Marcha'),
        ('fuera_de_servicio', 'Fuera de Servicio'),
    )

    nombre = models.CharField(max_length=80)
    estado = models.CharField(max_length=80, choices=choices)


class Viaje(models.Model):

    salida = models.ManyToManyField(Articulo, related_name="salida")
    entrada = models.ManyToManyField(Articulo, related_name="entrada")
