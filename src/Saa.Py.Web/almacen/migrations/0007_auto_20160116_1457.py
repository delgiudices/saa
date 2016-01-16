# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('almacen', '0006_auto_20160116_1456'),
    ]

    operations = [
        migrations.CreateModel(
            name='ArticuloViaje',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('cantidad', models.PositiveIntegerField()),
                ('articulo', models.ForeignKey(to='almacen.Articulo')),
            ],
        ),
        migrations.CreateModel(
            name='Viaje',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('salida', models.ManyToManyField(related_name='salida', through='almacen.ArticuloViaje', to='almacen.Articulo')),
            ],
        ),
        migrations.AddField(
            model_name='articuloviaje',
            name='viaje',
            field=models.ForeignKey(to='almacen.Viaje'),
        ),
    ]
