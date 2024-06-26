from setuptools import setup, find_packages

setup(
    name='space_invaders_rewebed',
    version='1.0',
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        'annotated-types==0.6.0',
        'anyio==4.3.0',
        'blinker==1.7.0',
        'click==8.1.7',
        'colorama==0.4.6',
        'exceptiongroup==1.2.0',
        'Flask==3.0.2',
        'Flask-SQLAlchemy==3.1.1',
        'greenlet==3.0.3',
        'idna==3.6',
        'itsdangerous==2.1.2',
        'Jinja2==3.1.3',
        'MarkupSafe==2.1.5',
        'pydantic==2.6.3',
        'pydantic_core==2.16.3',
        'sniffio==1.3.1',
        'SQLAlchemy==2.0.28',
        'starlette==0.36.3',
        'typing_extensions==4.10.0',
        'Werkzeug==3.0.1'
    ],
    entry_points={
        'console_scripts': [
            'run_space_invaders_rewebed = app:main'
        ]
    }
)
