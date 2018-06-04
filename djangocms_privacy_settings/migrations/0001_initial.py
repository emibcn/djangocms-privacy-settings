# -*- coding: utf-8 -*-
# Generated by Django 1.11.11 on 2018-06-04 08:34
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('cms', '0020_old_tree_cleanup'),
    ]

    operations = [
        migrations.CreateModel(
            name='PrivacyPolicyCategory',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('category', models.CharField(choices=[('0', 'ESSENTIALS'), ('1', 'STATISTICS'), ('2', 'MARKETING')], max_length=1, verbose_name='Privacy category')),
                ('slug', models.SlugField(verbose_name='Id')),
                ('permissions', models.TextField(verbose_name='Permissions')),
            ],
            options={
                'verbose_name': 'Privacy category',
                'verbose_name_plural': 'Privacy categories',
            },
        ),
        migrations.CreateModel(
            name='PrivacyPolicySetting',
            fields=[
                ('cmsplugin_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, related_name='djangocms_privacy_settings_privacypolicysetting', serialize=False, to='cms.CMSPlugin')),
                ('terms_policies_url', models.URLField(verbose_name='Terms and policies link')),
                ('popup_intro', models.TextField(blank=True, default='Introduction...', null=True, verbose_name='Popup introduction')),
                ('cookie_notice', models.TextField(blank=True, default='Notice...', null=True, verbose_name='Notice popup bottom')),
            ],
            options={
                'verbose_name': 'Privacy setting',
                'verbose_name_plural': 'Privacy settings',
            },
            bases=('cms.cmsplugin',),
        ),
        migrations.AddField(
            model_name='privacypolicycategory',
            name='privacy_settings',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='djangocms_privacy_settings.PrivacyPolicySetting'),
        ),
    ]
