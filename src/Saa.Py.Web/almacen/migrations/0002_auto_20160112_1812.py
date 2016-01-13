# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('almacen', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Camino',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('distancia', models.PositiveIntegerField()),
                ('desde', models.ForeignKey(related_name='desde', to='almacen.Nodo')),
                ('hasta', models.ForeignKey(related_name='hasta', to='almacen.Nodo')),
            ],
        ),
        migrations.AddField(
            model_name='nodo',
            name='nodos',
            field=models.ManyToManyField(to='almacen.Nodo', through='almacen.Camino'),
        ),
    ]
