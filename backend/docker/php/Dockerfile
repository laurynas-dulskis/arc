FROM php:8.2-fpm

WORKDIR /srv/backend

ENV APP_ENV=dev

COPY --from=mlocati/php-extension-installer --link /usr/bin/install-php-extensions /usr/local/bin/

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git unzip libicu-dev libpq-dev libonig-dev libzip-dev zip \
    && docker-php-ext-install intl pdo pdo_mysql opcache

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

RUN apt-get update && apt-get install -y \
        acl \
        openssh-client \
    ;

RUN set -eux; \
        install-php-extensions \
    	pcov \
    	xdebug \
        apcu \
        intl \
        opcache \
    ;

RUN apt-get install -y libpq-dev \
    && docker-php-ext-install -j$(nproc) pdo_pgsql

 COPY ../../composer.* ../../symfony.* ./

COPY --link ../../ .
RUN rm -Rf /srv/backend/docker/
