from setuptools import setup, find_packages
from djangocms_privacy_settings import __version__

setup(
    name='djangocms-privacy-settings',
    version=__version__,
    packages=find_packages(),
    include_package_data=True,
    license='GNU General Public License',
    description='RGPD LAW SETTINGS',
    long_description=open('README.md').read(),
    url='https://github.com/Pyc0kw4k/djangocms-privacy-settings',
    author='Lozano Joaquim',
    author_email='joaquimlozano@gmail.com',
)