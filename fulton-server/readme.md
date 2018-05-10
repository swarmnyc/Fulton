# Fulton Server

---

Fulton Server is integrated many essential features and packages that a functional web server needs. Using Fulton Sever can accelerate a lot of time from building a state of art web server from scratch. 

## CLI
---
Use Fulton Server will Fulton CLI, [see](https://www.npmjs.com/package/fulton-cli)

## Integration

### [typescript](https://typescriptlang.org/)

we encourage you use Fulton Server with typescript because typescript provide many features and experiences that pure javascript doesn't have. And Fulton takes the advantage of decoration of typescript. 

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

Fulton Server is based on express. express is a very lite web server package and it is also most popular package for nodejs. And we use the feature of decoration of typescript to build Router. See [Router](https://swarmnyc.gitbooks.io/fulton/content/features/router.html) for more information.


### [inversify](http://inversify.io/) 

Dependency Injection(DI) and inversion of control(IoC) are a good developing pattern. And inversify is a very mature package, so we includes it into Fulton Server. See [DI](https://swarmnyc.gitbooks.io/fulton/content/features/di.html) for more information.

### [passport](http://www.passportjs.org/)

Authentication is a basic feature of a functional web server. Fulton Server providers this feature definitely. Authentication is somehow complicated, so Fulton Server integrates passport, a useful authentication package, to help your web server authenticate users. See [Identity](https://swarmnyc.gitbooks.io/fulton/content/identity.html) for more information.

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

Fulton Server has js-docs for almost all of public classes, functions and members on its typescript declaration files. Therefore, typescript supported IDEs such as Visual Studio Code can give you Auto-Complete with documents that can improve the coding experiences as this picture.

![server-options-auto-complete](/assets/server-options-auto-complete.gif) 

As you can see, the features of Fulton Server can be very easy to change. See [Options](https://swarmnyc.gitbooks.io/fulton/content/options.html) for more information.


## Dependencies 

when you install fulton-server, almost all of dependencies are installed expect of some optional dependencies. When you enable the features, you have to install these packages, too.

- Database drivers:
    - for mongodb : run `npm install mongodb@2.2`
    - for SQLite : run `npm install sqlite3`
- For Google Auth : run `npm install google-auth-library`
- For Github Auth : run `npm install passport-github`
- For Swagger Docs : run `npm install swagger-ui-express`
    

## Requirements
- node.js > 7.0, Fulton Server uses a lot of features on ES2015 and ES2016, so it needs newer version of nodejs
- typescript > 2.4

## Issues

There are some known issues, see the notes to avoid the issues.
- Because typescript isn't really a programming language. The ts code will compiled to javascript. And javascript doesn't have interface and generic type and a lot features which only exists on typescript for helping coding experience. After compiling, they are all gone. For example.

{% row %}
{% col "lg-6"%}
```typescript
// typescript
interface MyInterface{
    p1: string;
    p2: string;
}

class MyClass <T extends MyInterface> {
    p1: T;
    p2: T;
}

```
{% col "lg-6"%}
```javascript
// the javascript that complied from typescript
class MyClass {
}
// all others staff are gone.
```
{% endrow %}

This is why interface cannot be used for dependency injection and we must use decorators to let typescript generates metadata to use.

- typeorm has a problem for mongodb@3.0, use `npm install mongodb@2.2` to install previous version.

- zone.js has a problem for es2017. use es2016 for now.