import os
from setuptools import setup, find_packages
from djangocms_privacy_settings import __version__

def read(fname):
    # read the contents of a text file
    return open(os.path.join(os.path.dirname(__file__), fname)).read()

# allow setup.py to be run from any path
os.chdir(os.path.normpath(os.path.join(os.path.abspath(__file__), os.pardir)))

setup(
    name='djangocms-privacy-settings',
    version=__version__,
    packages=find_packages(),
    include_package_data=True,
    license='GNU General Public License',
    description='RGPD LAW SETTINGS',
    long_description=read('README.md'),
    url='https://github.com/Pyc0kw4k/djangocms-privacy-settings',
    author='Lozano Joaquim',
    author_email='joaquimlozano@gmail.com',
)