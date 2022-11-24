This documents describes the infrastructure which supports core functionality with micro services for cross-cutting concerns.
 
At the moment the infrastructure consists of the following services:
- application gateway
- run time service registry (eureka) 
- OIDC authentication service (key cloak)

To provide a service in the ecosystem, the service have to be registered at the service registry with an application name. After that your service is available via that name from the outside via the application gateway (for example: http://gateway.local/yourname).


# Service registration

We use "eureka" as a service registry which supports self registration at runtime. The entries are shown here https://staging.sse.uni-hildesheim.de:3080/REGISTRY/
Keep in mind that the network address shown on the dashboard represents the path from which the services reached the gateway. Through that the address might be an internal hostname or private ip-address. 

To register your service you can make use of a dedicated eureka client which is available for most languages. As an alternative you can make a http-api call by yourself (which is not recommended). The eureka-client is only necessary for service registration, not for querying. To access other API you should use the gateway endpoints (like http://gateway.local/stu-backend/api/v2/)

See next sections for more information on how to register a service. For most languages there are dedicated eureka clients (even though we do not need the most features). 

## Java Spring Projects
In case you develop a java spring application include the following dependency `spring-cloud-starter-netflix-eureka-client`. Then you simply add the following configuration string:

```
eureka:
  client:
    serviceUrl:
      defaultZone: https://staging.sse.uni-hildesheim.de:3080/REGISTRY/
```   

> https://cloud.spring.io/spring-cloud-netflix/multi/multi__service_discovery_eureka_clients.html

## JS/TS Projects
For JS/TS projects we recommend the eureka-js-client (https://github.com/jquatier/eureka-js-client). 

```js
const client = new Eureka({
    instance: {
      app: 'APPNAME', 
      hostName: 'APPHOST', 
      ipAddr: 'APPADDR',
      statusPageUrl: 'HEALTHENDPOINT',
      port: {
        '$': 8080,
        '@enabled': 'true',
      },
      vipAddress: 'OWNVIP',
      dataCenterInfo: {
        '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
        name: 'STAGING',
      },
    },
    eureka: {
      serviceUrls: {
          default: [ 'https://staging.sse.uni-hildesheim.de:3080/REGISTRY/eureka/apps']
      }
  });
```

The instance information will be visible on the registry dashboard. 
- "app" is the identifier which the gateway uses
- "ipAddr" is the service address which is prefferred to reach the registry
- "statusPageUrl" is used for health checks (and is visible on the dashboard)

# Authentication

Currently OpenID Connect (OIDC) is the only supported authentication mechanism. All common programming languages should have a dedicated OIDC client. 
This section covers only the most important steps to use the OIDC service. 

## Basic OIDC Concept

OIDC is based on OAuth2. In the following we explain the most common flow for login, the authorization code flow:.Lets assume a service called "STU" 
1. User clicks on "Login"
2. STU redirects authentication attempt to auth-service
3. The auth-service prompts the user a login site and handles the authentication and redirects the user back to STU with a authorization `code`
4. STU uses the `code` to ask the auth-service for an access token (in this step a clientId and clientSecret is used to authenticate STU)
5. auth-service response with an id and access token (and optionally a refresh token)

The software in use is "keycloak" which supports the vast majority of OIDC features. 
Other flows and grant types with explanations (which are all supported by keycloak):
> https://developers.onelogin.com/openid-connect

If your service is a single page application/standalone frontend, you can't store the clientId and clientSecret. In the early days, the implicit code flow was used to address this issue. 
Although it is supported by keycloak, it is **not** supported as flow in this infrastructure. TODO

## Usage

1. Use an OIDC framework for your project 
2. The OIDC issuer is https://staging.sse.uni-hildesheim.de:8443/realms/UniHi (and the configuration page is https://staging.sse.uni-hildesheim.de:8443/realms/UniHi/.well-known/openid-configuration)
3. Ask the keycloak admin for credentials and tell him the needed grant (with PKCE or without) - for this step your service need a fixed address which will be added to the allowed list of redirects. 