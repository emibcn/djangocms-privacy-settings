# -*- coding: utf-8 -*-
# Generated by Django 1.11.11 on 2018-06-01 02:10
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('djangocms_privacy_settings', '0003_auto_20180531_1029'),
    ]

    operations = [
        migrations.AddField(
            model_name='privacypolicycategory',
            name='slug',
            field=models.SlugField(default='first-level', verbose_name='Id'),
        ),
        migrations.AddField(
            model_name='privacypolicycategory',
            name='title',
            field=models.CharField(default='First level', max_length=100, verbose_name='Title'),
        ),
    ]