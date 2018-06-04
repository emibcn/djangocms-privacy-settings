# -*- coding: utf-8 -*-

from aldryn_client import forms


class Form(forms.BaseForm):
    google_ua = forms.CharField("Google UA", required=True)


    def to_settings(self, data, settings):
        settings['INSTALLED_APPS'].extend(['djangocms_privacy_settings'])
        settings['GOOGLE_UA'] = data['google_ua']

        return settings