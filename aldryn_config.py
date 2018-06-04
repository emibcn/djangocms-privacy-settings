# -*- coding: utf-8 -*-

from aldryn_client import forms


class Form(forms.BaseForm):
    google_ua = forms.CharField("Google UA", required=True)


    def to_settings(self, data, settings):
        settings['GOOGLE_UA'] = data.get('google_ua', '')
        try:
            settings['GOOGLE_UA'] = data.get('google_ua')
        except (ValueError, TypeError):
            pass
        return settings