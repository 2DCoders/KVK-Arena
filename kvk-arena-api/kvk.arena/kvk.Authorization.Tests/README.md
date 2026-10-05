# API authorization regression checks

From `kvk-arena-api/kvk.arena`, run:

```powershell
dotnet run --project kvk.Authorization.Tests --configuration Release -p:NuGetAudit=false
```

This executable checks the compiled controller route and authorization attributes with real HTTP requests through JWT authentication, authorization, and tenant middleware. It uses a temporary local server and replaces business actions with a success response, so it needs no database and changes no application data.

The checks verify that customer registration, login, catalogs, availability, shared booking actions, and payment callbacks remain anonymous; staff routes require a valid token. They cover missing, malformed, expired, incorrectly signed, wrong-issuer, and wrong-audience tokens. Valid tokens with no permission claims are accepted because these attributes require authentication without role or permission policies.

The public-route list is explicit so an accidental change to either a public or protected action fails the checks. Health checks and the unused role controller are outside this change's scope.