# Gateway Docker Deploy
The repository contains a docker-compose.yml to start the registry and gateway. For more information about the gateway visit the respective [repository](https://github.com/e-Learning-by-SSE/infrastructure-gateway-service)

## Usage

The gateway uses the internal registry automatically. You just have to provide the OIDC settings (via environment variables):
```.env
GW_OIDC_CLIENTID=sse-gateway
GW_OIDC_SECRET=<secret>
```
The gateway default port is `8090` (the internal one is `8080`). 

Typically further configuration are necessary (e.g. route configuration). 
For this you need to create a file called `gateway-config.yml` and put all spring configuration into it. 

### HTTPS
For HTTPS it is sufficient to provide a keystore which contains the TLS certificates.
To create a p12 keystore use:

```console
$ openssl pkcs12 -export -in server-fullchain.pem -inkey server.key -out server.p12
```

Then set the keystore via environment variable in the docker compose file (you can also provide the setting via the `gateway-config.yml`) and mount the keystore. This can be done by creating a file called `docker-compose.override.yml` with the following content:

```yaml
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
You can also mount a complete application file by creating a `docker-compose-override.yml` with the following content:

```yaml
version: '3.9'

services:
  registry:
    environment:    
      SPRING_PROFILES_ACTIVE: prod
    volumes:
      - ./registry-config.yml:/workspace/application-prod.yml

```