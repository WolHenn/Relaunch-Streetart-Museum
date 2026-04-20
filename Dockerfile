FROM php:8.2-apache-bookworm

RUN apt-get update && apt-get upgrade -y --no-install-recommends \
    && docker-php-ext-install mysqli pdo pdo_mysql \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

RUN a2enmod rewrite

# Apache-Konfiguration: AllowOverride und assets-Zugriff erlauben
RUN echo '<Directory /var/www/html>\n\
    Options Indexes FollowSymLinks\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>\n\
<Directory /var/www/html/assets>\n\
    Options Indexes FollowSymLinks\n\
    AllowOverride None\n\
    Require all granted\n\
</Directory>' > /etc/apache2/conf-available/custom.conf \
    && a2enconf custom

COPY index.php /var/www/html/
COPY .htaccess /var/www/html/
COPY /src/ArtistsController.php /var/www/html/src/
COPY /src/ArtistsGateway.php /var/www/html/src/
COPY /src/authorization.php /var/www/html/src/
COPY /src/bootstrap.php /var/www/html/src/
COPY /src/config.php /var/www/html/src/
COPY /src/Database.php /var/www/html/src/
COPY /src/ErrorHandler.php /var/www/html/src/
COPY /src/login.php /var/www/html/src/

EXPOSE 80
CMD ["apache2ctl", "-D", "FOREGROUND"]