# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('almacen', '0007_auto_20160116_1457'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='viaje',
            name='salida',
        ),
        migrations.AddField(
            model_name='viaje',
            name='almacen',
            field=models.ForeignKey(default=None, to='almacen.Almacen'),
            preserve_default=False,
        ),
    ]
