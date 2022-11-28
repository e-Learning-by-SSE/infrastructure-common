# Full standalone infrastructure

The `docker-compose.yml` boots a complete standalone infrastructure with the following services:
- Authentication Service (Keycloak)
- [Runtime Registry](https://github.com/e-Learning-by-SSE/infrastructure-registry-service)
- [Application Gateway](https://github.com/e-Learning-by-SSE/infrastructure-gateway-service)
- internal postgresDB

We recommend using this setup if you intent to run the infrastructure under the following conditions:
- Everything runs on the same maschine.
- You use no additional webserver as reverse proxy for http termination.
- You want to serve keycloak via the gateway (gateway terminates HTTPS).

Otherwise consider to run two seperates projects. The gateway needs keycloak credentials in order to start, and the keycloak wants to have HTTPS enabled in order to do the necessary configurations.

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

Since you do not have no credentials for the gateway on the **first startup**, leave those fields empty and run the infrastructure via
```console
$ docker compose -f docker-compose.yml -f apache2.yml up postgres keycloak apache
```

Then open keycloak via https://localhost/setup (change hostnames to your need - don't forget to set it in the `.env`) and create the credentials for the gateway. 

After that use fill set the credentials to the `.env` file and start the services normally:
```console
$ docker compose -f docker-compose.yml -f apache2.yml down
$ docker compose up -d
```

## Container
For the respective container configuration and explanation see the following sub sections. 

### Postgres & Keycloak
Please have a look [here](../keycloak/)

### Gateway & Registry
Please have a look [here](../gateway/)
