# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('almacen', '0008_auto_20160116_1500'),
    ]

    operations = [
        migrations.AddField(
            model_name='articuloviaje',
            name='tipo',
            field=models.CharField(default=None, max_length=10, choices=[(b'entrada', b'Entrada'), (b'salida', b'Salida')]),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='viaje',
            name='articulos',
            field=models.ManyToManyField(to='almacen.Articulo', through='almacen.ArticuloViaje'),
        ),
    ]
