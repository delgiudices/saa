# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Almacen',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('nombre', models.CharField(max_length=80)),
            ],
        ),
        migrations.CreateModel(
            name='Articulo',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('nombre', models.CharField(max_length=80)),
            ],
        ),
        migrations.CreateModel(
            name='Nodo',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('tipo', models.CharField(max_length=80, choices=[(b'salida', b'Salida'), (b'entrada', b'Entrada'), (b'almacen', b'Almacen')])),
                ('almacen', models.ForeignKey(to='almacen.Almacen')),
            ],
        ),
        migrations.CreateModel(
            name='Nodo_Articulo',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('cantidad', models.PositiveIntegerField()),
                ('articulo', models.ForeignKey(to='almacen.Articulo')),
                ('nodo', models.ForeignKey(to='almacen.Nodo')),
            ],
        ),
        migrations.CreateModel(
            name='Robot',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('nombre', models.CharField(max_length=80)),
                ('estado', models.CharField(max_length=80, choices=[(b'disponible', b'Disponible'), (b'marcha', b'En Marcha'), (b'fuera_de_servicio', b'Fuera de Servicio')])),
            ],
        ),
        migrations.CreateModel(
            name='Viaje',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('entrada', models.ManyToManyField(related_name='entrada', to='almacen.Articulo')),
                ('salida', models.ManyToManyField(related_name='salida', to='almacen.Articulo')),
            ],
        ),
        migrations.AddField(
            model_name='nodo',
            name='articulos',
            field=models.ManyToManyField(to='almacen.Articulo', through='almacen.Nodo_Articulo'),
        ),
    ]
