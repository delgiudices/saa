from django.contrib import admin
from almacen import models


admin.site.register(models.Almacen)
admin.site.register(models.Nodo)
admin.site.register(models.Articulo)
admin.site.register(models.Robot)
admin.site.register(models.Viaje)
admin.site.register(models.Nodo_Articulo)
admin.site.register(models.Camino)
admin.site.register(models.ArticuloViaje)
