FROM python:3.6-alpine

# Ensure packages are up to date and install some useful utilities
RUN apk add --no-cache \
	postgresql-dev git vim libffi-dev gcc musl-dev libxml2-dev \
	libxslt-dev

# Install any explicit requirements and any deployment requirements.
ADD requirements.txt requirements_deployment.txt /tmp/
RUN pip install --no-cache-dir --upgrade -r /tmp/requirements.txt && \
	pip install --no-cache-dir --upgrade -r /tmp/requirements_deployment.txt

# Copy the root
ADD ./ /usr/src/app/

# From now on, work in the application directory
WORKDIR /usr/src/app

# By default, we use the settings module bundled with this repo. Change
# DJANGO_SETTINGS_MODULE to install a custom settings. Note that we add it to
# the application root so we do not need the "smswebapp." prefix to the settings
# module.
ADD settings_deployment.py /usr/src/app/

# Default environment for image.
ENV \
	PORT=8080                                       \
	AUTOMATION_WEBAPP_CONTEXT="git commit: ${commit}" \
	DJANGO_SETTINGS_MODULE=settings_deployment      \
	DJANGO_DB_ENGINE=django.db.backends.postgresql  \
	DJANGO_DB_HOST=localhost                        \
	DJANGO_DB_PORT=5432                             \
	DJANGO_DB_USER=webapp                           \
	SMS_WEBAPP_BRANCH=${branch}

# Use gunicorn as a web-server
CMD ./manage.py migrate && gunicorn --access-logfile - --bind :$PORT smswebapp.wsgi
