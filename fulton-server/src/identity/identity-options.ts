import * as lodash from 'lodash';
import { AccessTokenOptions } from './options/access-token-options';
import { AppMode, Middleware, Type } from '../interfaces';
import { BearerStrategyOptions } from './options/bearer-strategy-options';
import { Env } from '../helpers/env';
import { FacebookStrategyOptions } from './options/facebook-strategy-options';
import { GithubStrategyOptions } from './options/github-strategy-options';
import { GoogleStrategyOptions } from './options/google-strategy-options';
import { IUser, IUserService, Strategy } from './interfaces';
import { LoginStrategyOptions } from './options/login-strategy-options';
import { OauthStrategyOptions } from './options/oauth-strategy-options';
import { Options } from '../options/options';
import { RegisterOptions } from './options/register-options';
import { StrategyOptions } from './options/strategy-options';
import { StrategySettings } from './options/strategy-settings';
import { ForgotPasswordOptions } from './options/forgot-password-options';

export class IdentityOptions {
    /**
     * the default value is false
     * It can be overridden by process.env["{appName}.options.identity.enabled"]
     */
    enabled: boolean = false;

    /**
     * the database connection name, the default value is "default"
     */
    databaseConnectionName: string;

    /**
     * the instance or type of UserService
     * the default value is FultonUserService
     * it can be used like
     * `req.userService`
     * 
     * if your user schema is like FultonUser and auth strategies is
     * username-password and bearer token, then you don't need to change this value,
     * otherwise you have to custom your user service;
     */
    userService: Type<IUserService<IUser>> | IUserService<IUser>;

    /**
     * the authenticate every request to get user info, enabled strategies like "bearer", "session"
     * for api mode, default is FultonImp.defaultAuthenticate
     * 
     * ## custom example
     * ```
     * defaultAuthenticate = (req: Request, res: Response, next: NextFunction) => {
     *     // authenticate every request to get user info.
     *     passport.authenticate(req.fultonApp.options.identity.supportList,
     *         function (error, user, info) {
     *             if (error) {
     *                 next(error);
     *             } else if (user) {
     *                 req.logIn(user, { session: false }, (err) => {
     *                     next(err);
     *                 });
     *             } else {
     *                 if (req.fultonApp.options.identity.defaultAuthenticateErrorIfFailure) {
     *                     res.sendResult(401);
     *                 } else {
     *                     next();
     *                 }
     *             }
     * 
     *         })(req, res, next);
     * }
     * ```
     */
    defaultAuthenticate: Middleware;

    /**
     * if true, throw error if a request don't have user certification (bearer token, cookie session id, etc)
     */
    defaultAuthenticateErrorIfFailure: boolean = false;

    /**
     * the authorizes apply to all router
     * the default value is []
     * 
     * for router level you can
     * ### example for router level
     * ```
     * // router level authorization
     * @router("/Food", authorize())
     * export class FoodRouter extends Router {
     *     // all actions needs to be authorized
     *     @httpGet()
     *     list(req: Request, res: Response) { }  
     *    
     *     @httpGet("/:id")
     *     detail(req: Request, res: Response) { }
     * } 
     * 
     * @router("/Food")
     * export class FoodRouter extends Router {
     *     // no authorize
     *     @httpGet() 
     *     list(req: Request, res: Response) { }     
     * 
     *     // action level authorization
     *     // authorize by admin role and logged in
     *     @httpDelete("/:id", authorizeByRole("admin")) 
     *     delete(req: Request, res: Response) { }
     * }
     * ```
     */
    defaultAuthorizes: Middleware[] = [];

    /**
     * the options for access token
     */
    readonly accessToken = new AccessTokenOptions(this.appName, this.appMode);

    /**
     * the setting for register, fulton doesn't have html for register, 
     * 
     * for render html, you have to add a router
     * 
     * ## example for web view
     * ```
     * @router("/auth")
     * export class AuthRouter extends Router {
     *     @httpGet("/register")
     *     registerView(req: Request, res: Response) {
     *         res.render("register");
     *     }
     * 
     *     // if you want to put all logics altogether
     *     // you can set options.identity.register.enabled = false
     *     // and add this action.
     *     @httpPost("/register"))
     *     register(req: Request, res: Response) {
     *         req.userService
     *            .register(req.body)
     *            .then(async(user)=> {
     *                  res.redirect("/");
     *            .catch(()=>{
     *                  res.sendStatus(400);
     *            });   
     *     }
     * }
     * ```
     */
    readonly register = new RegisterOptions(this.appName, this.appMode)

    /**
     * options for forgot password
     * there are three methods
     * 1.
     * /auth/forgot-password?username=username, for send reset code notification
     * /auth/forgot-password?email=email, for send reset code notification
     * 
     * 2.  
     * /auth/forgot-password?token=token&code=code, for just verfiy the token is valid or not
     * 
     * 3.  
     * /auth/forgot-password?token=token&code=code&password=new-password, for reset password
     */
    readonly forgotPassword = new ForgotPasswordOptions(this.appName, this.appMode)

    /**
     * the local strategy for login, fulton doesn't have html for login, 
     * 
     * for render html, you have to add a router
     * 
     * ## example for web view
     * ```
     * @router("/auth")
     * export class AuthRouter extends Router {
     *     @httpGet("/login")
     *     loginView(req: Request, res: Response) {
     *         res.render("login");
     *     }
     * 
     *     // if you want to all logics altogether
     *     // you can set options.identity.login.enabled = false
     *     // and add this action.
     *     @httpPost("/login", authenticate("local", { failureRedirect: "/auth/login" }))
     *     login(req: Request, res: Response) {
     *         res.redirect("/");
     *     }
     * }
     * ```
     */
    readonly login = new LoginStrategyOptions(this.appName, this.appMode)

    /**
     * options for passport bearer stragery
     */
    readonly bearer = new BearerStrategyOptions(this.appName, this.appMode)

    /**
     * pre-defined google strategy
     * path is `/auth/google`
     * callback is `/auth/google/callback`
     * scope is `profile email`
     * accessType is `online`
     * 
     * ## Require "google-auth-library" package ##
     * run `npm install google-auth-library` to install it
     * 
     * clientId can be overridden by env["{appName}.options.identity.google.clientId"]
     * clientSecret can be overridden by env["{appName}.options.identity.google.clientSecret"]
     */
    readonly google = new GoogleStrategyOptions(this.appName, this.appMode);

    /**
     * pre-defined github strategy
     * path is `/auth/github`
     * callback is `/auth/github/callback`
     * scope is `profile email`
     * 
     * ## Require "passport-github" package ##
     * run `npm install passport-github` to install it
     * 
     * clientId can be overridden by env["{appName}.options.identity.github.clientId"]
     * clientSecret can be overridden by env["{appName}.options.identity.github.clientSecret"]
     */
    readonly github = new GithubStrategyOptions(this.appName, this.appMode);

    /**
     * pre-defined facebook strategy
     * path is `/auth/facebook`
     * callback is `/auth/facebook/callback`
     * scope is empty
     * profileFields is ['id', 'displayName', 'photos', 'email']
     * 
     * ## Require "passport-facebook" package ##
     * run `npm install passport-facebook` to install it
     * 
     * clientId can be overridden by env["{appName}.options.identity.facebook.clientId"]
     * clientSecret can be overridden by env["{appName}.options.identity.facebook.clientSecret"]
     */
    readonly facebook = new FacebookStrategyOptions(this.appName, this.appMode);

    /** other passport strategies */
    readonly strategies: StrategySettings[] = [];

    /**
     * the strategies will be used by defaultAuthenticate. like bearer
     */
    readonly defaultAuthSupportStrategies: string[] = [];

    constructor(private appName: string, private appMode: AppMode) { }

    /**
     * load options from environment to override the current options 
     */
    init() {
        this.enabled = Env.getBoolean(`${this.appName}.options.identity.enabled`, this.enabled)

        for (const name of Object.getOwnPropertyNames(this)) {
            var prop: Options = lodash.get(this, name);

            if (prop && prop.init) {
                prop.init();
            }
        }
    }

    addStrategy(options: StrategyOptions | OauthStrategyOptions, strategy: Strategy | Type<Strategy>) {
        options.enabled = options.enabled == null ? true : options.enabled;

        this.strategies.push({
            options: options,
            strategy: strategy
        });
    }
}