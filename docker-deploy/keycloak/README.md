## Usage 
The OIDC authentication is provided via [keycloak](https://www.keycloak.org/). 
The default HTTP port is 8080 and the default HTTPS Port is 8443. You have two options to run keycloak:
1. with a reverse proxy which terminates tls,
2. or configure https directly with keycloak

(not using TLS can lead to undesired side effects, e.g. the admin page isn't loading)

The first step is to create the a file called `.env` inside the same directory where you placed the `docker-compose.yml`. It should contain:
```.env
HOSTNAME=<domain-to-reach-site>

KC_ADMIN=admin
KC_ADMIN_PW=<adminpw>

POSTGRESQL_USER=keycloak
POSTGRESQL_PASS=<PW>
```
Replace the neccessary entries. 

Then decide for one of the following options: 


**Option 1 - apache2 reverse proxy:**<br>
You can use any web server as reverse proxy. In this section we provide an example with apache2.

- Use the `docker-compose.yml` 
- Add the following snippet to your apache2 vhost configuration (you must have already configured https for this)
 ```apache
  <VirtualHost *:443>
  // .... cert configuration

    ProxyPreserveHost On
    SSLProxyEngine On
    SSLProxyCheckPeerCN on
    SSLProxyCheckPeerExpire on
    RequestHeader set X-Forwarded-Proto "https"
    RequestHeader set X-Forwarded-Port "443"
    
    ProxyPass / http://keycloak:8080/
    ProxyPassReverse / http://keycloak:8080/
    
  </VirtualHost>
 ```
- Look at [keycloaks documentation](https://www.keycloak.org/server/reverseproxy#_exposed_path_recommendations) to decide which paths you want to expose

To start the container run
```console
$ docker compose up -d
```

**Option 2 - native HTTPS:**<br>
To run keycloak with native https, you can use the `https-override.yml` alongside with the `docker-compose.yml`. 
Firt you need to add the follwing environment variables to your `.env`
  ```.env
  KC_HOSTNAME_PATH=<path-to-reach-site e.g /auth>
  KC_HOSTNAME_ADMIN=<domain-to-reach-adminpage>

  HTTPS_CERT_KEY=<e.g /ssl/example.de.key>
  HTTPS_CERT_CRT=<e.g /ssl/example.de.fullchain.pem>
  ```

If you wish to change the default path of keycloak, you can add the following line to the environment section in the compose file:
```.env
KC_HTTP_RELATIVE_PATH: /test
```
This can be helpful for mitigate problems with ressource locations when using reverse proxys.

To start the contaienr run 
```console
$ docker compose -f docker-compose.yml -f https-override.yml up -d
```

## POSTGRES
The postgres data is stored as docker volume with the name "postgres_data". The postgres is only used by the keycloak authentication service. 



