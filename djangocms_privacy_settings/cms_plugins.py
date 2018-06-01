# -*- coding: utf-8 -*-
from django.utils.translation import ugettext_lazy as _
from django.conf import settings

from cms.plugin_base import CMSPluginBase
from cms.plugin_pool import plugin_pool
from .models import PrivacyPolicySetting
from .admin import PrivacyPolicyCategoryInline

from django.template.defaultfilters import slugify

class PrivacyPolicyPlugin(CMSPluginBase):
    model = PrivacyPolicySetting
    name = _("Privacy policy")
    module = _("Parent Privacy")
    render_template = "djangocms_privacy_settings/privacy_settings.html"
    inlines = (PrivacyPolicyCategoryInline,)

    def render(self, context, instance, placeholder):
        context.update({
            'instance': instance,
            'categories': instance.get_categories_json(),
            'google_ua': settings.google_ua
        })
        return context


plugin_pool.register_plugin(PrivacyPolicyPlugin)
