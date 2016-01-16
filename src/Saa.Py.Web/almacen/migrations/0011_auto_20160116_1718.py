# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import jsonfield.fields


class Migration(migrations.Migration):

    dependencies = [
        ('almacen', '0010_viaje_path'),
    ]

    operations = [
        migrations.AlterField(
            model_name='viaje',
            name='path',
            field=jsonfield.fields.JSONField(null=True),
        ),
    ]
