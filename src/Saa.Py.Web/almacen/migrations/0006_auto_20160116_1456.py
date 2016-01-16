# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('almacen', '0005_auto_20160114_1923'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='viaje',
            name='entrada',
        ),
        migrations.RemoveField(
            model_name='viaje',
            name='salida',
        ),
        migrations.DeleteModel(
            name='Viaje',
        ),
    ]
