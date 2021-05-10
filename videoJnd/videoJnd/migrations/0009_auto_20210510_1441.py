# Generated by Django 3.1.6 on 2021-05-10 14:41

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('videoJnd', '0008_auto_20210510_0732'),
    ]

    operations = [
        migrations.AlterField(
            model_name='experiment',
            name='duration',
            field=models.IntegerField(default=600, validators=[django.core.validators.MinValueValidator(10)], verbose_name='Duration(seconds)'),
        ),
    ]
