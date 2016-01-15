# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('almacen', '0004_auto_20160114_1905'),
    ]

    operations = [
        migrations.AddField(
            model_name='nodo',
            name='x',
            field=models.IntegerField(default=1),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='nodo',
            name='y',
            field=models.IntegerField(default=2),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='nodo_articulo',
            name='capacidad',
            field=models.PositiveIntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='nodo',
            name='tipo',
            field=models.CharField(max_length=80, choices=[(b'salida', b'Salida'), (b'entrada', b'Entrada'), (b'almacen', b'Almacen'), (b'punto', b'Punto')]),
        ),
    ]
