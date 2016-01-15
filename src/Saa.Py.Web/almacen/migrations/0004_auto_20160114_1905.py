# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('almacen', '0003_almacen_mapa'),
    ]

    operations = [
        migrations.AlterField(
            model_name='almacen',
            name='mapa',
            field=models.ImageField(null=True, upload_to=b'', blank=True),
        ),
    ]
