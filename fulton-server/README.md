# Fulton Server

---

Fulton Server is integrated many essential features and packages that a functional web server needs. Using Fulton Sever can accelerate a lot of time from building a state of art web server from scratch. 

## CLI
---
Using Fulton Server with [Fulton CLI](https://www.npmjs.com/package/fulton-cli) can helps you get started with Fulton.

## Integration

### [typescript](https://typescriptlang.org/)

we encourage you use Fulton Server with typescript because typescript provide better experiences than pure javascript. Also, Fulton Server takes the advantage of decoration of typescript. 

For Example, 
``` typescript
@router("/my")
class MyRouter extends Router {
    @httpGet()
    hi(req, res){
        res.send("Hi there")
    }
}
```
here `@router` and `@httpGet` are the decorators. As you can see, it make your code more meaningful.

### [express](https://expressjs.com/) 

Fulton Server is based on express. express is a very lite and the most popular web framework for nodejs. And we use the feature of decoration of typescript to build Router. See [Router](https://swarmnyc.gitbooks.io/fulton/content/features/router.html) for more information.


### [inversify](http://inversify.io/) 

Dependency Injection(DI) and inversion of control(IoC) are a good developing pattern. And inversify is a very mature package, so we includes it into Fulton Server. See [DI](https://swarmnyc.gitbooks.io/fulton/content/features/di.html) for more information.

### [passport](http://www.passportjs.org/)

Authentication is a basic feature of a web server. Fulton Server providers this feature definitely. Authentication is somehow complicated, so Fulton Server integrates passport, a useful authentication package, to help your web server authenticate users. See [Identity](https://swarmnyc.gitbooks.io/fulton/content/identity.html) for more information.

### [typeorm](http://typeorm.io)

Fulton Server takes the advantages of typeorm to connect multiple database engine. See [Entity](https://swarmnyc.gitbooks.io/fulton/content/features/entity.html) for more information.

### [swagger](http://swagger.io)

Fulton Server can generate swagger.json that might help export your web server to other service. Also, Fulton Server embedded the swagger ui, so developments can see the api docs with look at code. See [docs](https://swarmnyc.gitbooks.io/fulton/content/features/docs.html) for more information.


### [winston](https://github.com/winstonjs/winston) 

Fulton Server uses winston for its loggers. See [logging](https://swarmnyc.gitbooks.io/fulton/content/features/logging.html) for more information.

### [jsonapi](http://jsonapi.org/) 

Fulton Server fully supports jsonapi. 


## Options
We want Fulton can be easy to configure, so we put almost every configurable settings in options variable. 
For example,

``` typescript
export class ExampleApp extends FultonApp {
    protected async onInit(options: FultonAppOptions): Promise<any> {
        options.routers = [
            FoodRouter,
            IngredientRouter
        ];
        
        options.entities = [Food, Ingredient]

        options.cors.enabled = true;
        options.docs.enabled = true;

        options.identity.enabled = true;
        options.identity.google.enabled = true;
    }
}
```

See [Options](https://swarmnyc.gitbooks.io/fulton/content/options.html) for more information.
    

## Requirements
- node.js > 7.0, Fulton Server uses a lot of features on ES2015 and ES2016, so it needs newer version of nodejs
- typescript > 2.4

## Issues

There are some known issues, see the notes to avoid the issues.
- Because typescript isn't really a programming language. The ts code will compiled to javascript. And javascript doesn't have interface and generic type and a lot features which only exists on typescript for helping coding experience. After compiling, they are all gone.

- zone.js has a problem for es2017. use es2016 for now.
