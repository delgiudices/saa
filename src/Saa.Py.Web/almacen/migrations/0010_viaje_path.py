# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import jsonfield.fields


class Migration(migrations.Migration):

    dependencies = [
        ('almacen', '0009_auto_20160116_1506'),
    ]

    operations = [
        migrations.AddField(
            model_name='viaje',
            name='path',
            field=jsonfield.fields.JSONField(default=None),
            preserve_default=False,
        ),
    ]
