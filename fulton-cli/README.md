# Fulton Cli

CLI tool for Fulton that help you get start with Fulton.


## Installation

```
npm i -g fulton-cli
```

## Commands
type `fulton` or `fulton help <command>` to see the all usages. all commands support wizard style to help you complete the command, or you con provide the particular options directly to skip the wizard.

### New
**new command** helps you create a new web project powered by fulton-server

![fulton-new](/assets/fulton-new.gif)

#### Options:

* `-n, --name <name>` the name of the app* 
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

### Build

### Serve

### Test
