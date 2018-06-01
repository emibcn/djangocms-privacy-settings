from django.db import models
from django.utils.translation import ugettext as _
from cms.plugin_base import CMSPlugin
import json
from django.template.defaultfilters import slugify

PRIVACY_CATEGORIES = [
    ('0', 'ESSENTIALS'),
    ('1', 'STATISTICS'),
    ('2', 'MARKETING'),
]

class PrivacyPolicySetting(CMSPlugin):
    terms_policies_url = models.URLField(verbose_name=_("Terms and policies link"))
    popup_intro = models.TextField(verbose_name=_("Popup introduction"), null=True, blank=True, default=_("Introduction..."))
    cookie_notice = models.TextField(verbose_name=_("Notice popup bottom"), null=True, blank=True, default=_("Notice..."))

    def __str__(self):
        return _("Privacy setting")

    class Meta:
        verbose_name = _("Privacy setting")
        verbose_name_plural = _("Privacy settings")

    def copy_relations(self, oldinstance):
        for category in oldinstance.privacypolicycategory_set.all():
            new_category = PrivacyPolicyCategory()
            new_category.category = category.category
            new_category.permissions = category.permissions
            new_category.privacy_settings = self
            new_category.save()

    def get_categories_json(self):
        categories = PrivacyPolicyCategory.objects.filter(privacy_settings=self)
        data = {}
        data['levels'] = []
        index = 0
        for cat in categories:
            index+=1
            data['levels'].append({
                'id': str(cat.slug),
                'title': cat.get_category_display(),
                'permissions': cat.permissions.split(',')
            })

        json_data = json.dumps(data['levels'])

        return json_data

    def get_first_cat_id(self):
        first_cat = PrivacyPolicyCategory.objects.all()[:1].get()
        return first_cat.slug



class PrivacyPolicyCategory(models.Model):
    category = models.CharField(choices=PRIVACY_CATEGORIES, max_length=1, verbose_name=_("Privacy category"))
    slug = models.SlugField(verbose_name=_("Id"))
    permissions = models.TextField(verbose_name=_("Permissions"))
    privacy_settings = models.ForeignKey(PrivacyPolicySetting)

    def __str__(self):
        return self.get_category_display()


    class Meta:
        verbose_name = _("Privacy category")
        verbose_name_plural = _("Privacy categories")

    def save(self, *args, **kwargs):
        self.slug = slugify(self.get_category_display())
        super(PrivacyPolicyCategory, self).save(*args, **kwargs)

