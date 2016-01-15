# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('almacen', '0002_auto_20160112_1812'),
    ]

    operations = [
        migrations.AddField(
            model_name='almacen',
            name='mapa',
            field=models.ImageField(default=None, upload_to=b''),
            preserve_default=False,
        ),
    ]
