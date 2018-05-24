# Fulton CLI

CLI tool for Fulton that help you get start with Fulton.


## Installation

```
npm i -g fulton-cli
```

## Commands
type `fulton` or `fulton help <command>` to see the all usages. all commands support wizard style to help you complete the command, or you con provide the particular options directly to skip the wizard.

### New
**new command** helps you create a new web project powered by fulton-server

![fulton-new](assets/fulton-new.gif)

#### Usage:
* `fulton new [name]` or `fulton n [name]`
    * `[name]` the name of the app*

#### Options:
* `-d, --databases <engine,engine,engine,...>` the database engines the app uses
    * the support engines are: 
        * mongodb
        * mysql (soon) 
        * mssql (soon) 
        * postgres (soon) 
        * others (soon) 
* `-f, --features <feature,feature,feature,...>` enabled the features of the app
    * identitiy - this feature is involved supporting User Register, Login, Authentication and Authorization.
    * oauth-google - this feature is involved supporting Google OAuth Login.
    * oauth-facebook - this feature is involved supporting Facebook OAuth Login.
    * oauth-github - this feature is involved supporting GitHub OAuth Login.
    * api-docs - this feature is involved supporting Swagger UI documentation.
    * compression - this feature is involved supporting compression http response.
    * cors - this feature is involved supporting broswer cors.
    * email - this feature is involved supporting sending email to users.
    * json-api - this feature is involved supporting response json-api format.
    * docker - this feature is involved supporting docker.

### Generate
**generate command** helps you scaffolding files

![fulton-new](assets/fulton-new.gif)

#### Schematic
Supported schematics:
* `e, entity` scaffolding a entity of Database ORM file.
* `n, entity-router` scaffolding a router file.
* `r, router` scaffolding a router file.
* `s, service` scaffolding a service file.

#### Options:
* `-f, --force` override the file if it exists.
* `--not-open` not open the file after it is generated.
* `--not-import` not import the reference into app.ts after it is generated.

### Feature
**feature command** helps you add or remove features

![fulton-feature](assets/fulton-feature.gif)

### Global Options
* `-h, --help` Display help.
* `--no-color` Disable colors.
