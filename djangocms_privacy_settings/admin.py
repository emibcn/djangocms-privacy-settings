# -*- coding: utf-8 -*-

from django.contrib import admin
from .models import PrivacyPolicyCategory, PrivacyPolicySetting
from .forms import PrivacyPolicyCategoryForm
from cms.admin.placeholderadmin import PlaceholderAdminMixin

class PrivacyPolicyCategoryInline(admin.StackedInline):
    model = PrivacyPolicyCategory
    extra = 1
    max_num = 3
    form = PrivacyPolicyCategoryForm


class PrivacyPolicyAdmin(admin.ModelAdmin):
    inlines = (PrivacyPolicyCategoryInline,)


class PrivacyPolicyCategoryAdmin(PlaceholderAdminMixin, admin.ModelAdmin):
    form = PrivacyPolicyCategoryForm

    fieldsets = [
        (None, {
            'fields': (
                'category',
                ('permissions',),
            )
        }),
    ]

#admin.site.register(PrivacyPolicySetting, PrivacyPolicyAdmin)
#admin.site.register(PrivacyPolicyCategory, PrivacyPolicyCategoryAdmin)


