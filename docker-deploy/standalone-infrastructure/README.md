# Full standalone infrastructure

The `docker-compose.yml` boots a complete standalone infrastructure with the following services:
- Authentication Service (Keycloak)
- [Runtime Registry](https://github.com/e-Learning-by-SSE/infrastructure-registry-service)
- [Application Gateway](https://github.com/e-Learning-by-SSE/infrastructure-gateway-service)
- internal postgresDB


## Usage 
You need to provide the following environments (e.g. create a `./.env` file):

```
HOSTNAME=<domain-to-reach-site>

KC_ADMIN=admin
KC_ADMIN_PW=<adminpw>

POSTGRESQL_USER=keycloak
POSTGRESQL_PASS=<PW>

GW_OIDC_CLIENTID=sse-gateway
GW_OIDC_SECRET=<secret>
```

The default 

## Container explanation

### POSTGRES
The postgres data is stored as docker volume with the name "postgres_data". The postgres is only used by the keycloak authentication service. 

### Keycloak Auth
The OIDC authentication is provided via [keycloak](https://www.keycloak.org/). 
The default HTTP port is 8080 and the default HTTPS Port is 8443. You have two options two run keycloak:
1. with a reverse proxy which terminates tls,
2. or to use configure https directly with keycloak

**Option 1:**
You can use any web server as reverse proxy. In this section we provide an example with apache2.

- Use the `docker-compose.yml` 
- Add the following snippet to your apache2 vhost configuration (you must have already configured https for this)
 ```
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

**Option 2:**
To run keycloak with native https, you can use the `https-override.yml` alongside with the `docker-compose.yml`. 
- Firt you need to add the follwing environment variables to your `.env`
  ```
  KC_HOSTNAME_PATH=<path-to-reach-site e.g /auth>
  KC_HOSTNAME_ADMIN=<domain-to-reach-adminpage>

  HTTPS_CERT_KEY=<e.g /ssl/example.de.key>
  HTTPS_CERT_CRT=<e.g /ssl/example.de.fullchain.pem>
  ```
- Run docker: `docker compose -f docker-compose.yml -f https-override.yml up -d`


If you wish to change the default path of keycloak, you can add the following line to the environment section in the compose file:
```
KC_HTTP_RELATIVE_PATH: /test
```
This can be helpful for mitigate problems with ressource locations when using reverse proxys.


### Gateway
The gateway uses the internal registry automatically. You just have to provide the OIDC settings (via environment variables):
```
GW_OIDC_CLIENTID=sse-gateway
GW_OIDC_SECRET=<secret>
```
The gateway default port is `8090` (the internal one is `8080`). 

Typically further configuration are necessary (e.g. route configuration). 
For this you need to create a file called `gateway-config.yml` and put all spring configuration into it. 

**HTTPS**
For HTTPS it is sufficient to provide key-store which contains the TLS certificates.
To create a p12 keystore use:

```
openssl pkcs12 -export -in server-fullchain.pem -inkey server.key -out server.p12
```

Then set the keystore via environment variable in the docker compose file (you can also provide the setting via the `gateway-config.yml`) and mount the keystore. This can be done by creating a file called `docker-compose-override.yml` with the following content:

```
version: '3.9'
services:
  gateway:
    environment:
      SERVER_SSL_KEY-STORE: ./server.p12
      SERVER_SSL_KEY-STORE-PASSWORD: jasldjas
    volumes:
      - ./server.p12:/workspace/server.p12
```

The file is automatically loaded when using the default `docker-compose.yml`. To ensure it is loaded, specify it with `-f docker-compose-override.yml`. 
The gateway waits until the keycloak container is healthy. This is necessary because the underlying spring framework has a dependency to the OIDC service on startup. The gateway startup delay can be significant. 

### Registry
The registry is used by the gateway. It does not expose any ports (the exposed port of the container is 8761). Typically it isn't necessary to make furthor configuration to the registry. If you really need it, you can set all spring configurations as environment (replace dots with underscores: spring.profiles.active -> SPRING_PROFILES_ACTIVE).
You can also mount a complete application file by adding the following to the compose:

```diff
      depends_on:
        - postgres
  registry:
    image: ghcr.io/e-learning-by-sse/infrastructure-registry:1
+ environment:    
+   SPRING_PROFILES_ACTIVE: prod 
+ volumes:
+   - ./application-prod.yml:/workspace/application-prod.yml
  gateway:
    build: 
 ```