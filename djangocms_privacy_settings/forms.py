from django.forms import ModelForm
from .models import PrivacyPolicyCategory

class PrivacyPolicyCategoryForm(ModelForm):
    class Meta:
        model = PrivacyPolicyCategory
        exclude = ['slug']
