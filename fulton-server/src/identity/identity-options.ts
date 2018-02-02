import * as lodash from 'lodash';

import { AppMode, HttpMethod, PathIdentifier } from "../interfaces";
import { CustomStrategySettings, FultonUser, FultonUserService, IUser, Middleware, StrategyOptions, Type } from "../index";
import { GoogleStrategyOptions, IUserService, LocalStrategyVerifier, OAuthStrategyOptions, OAuthStrategyVerifier, TokenStrategyVerifier } from "./interfaces";

import { AuthenticateOptions } from "passport";
import { AuthorizeOptions } from "./authorizes-middlewares";
import Env from "../helpers/env";
import { FultonImpl } from "./fulton-impl/fulton-impl";
import { Repository } from "typeorm";
import { Strategy } from "passport";

export class IdentityOptions {
    /**
     * the default value is false
     * It can be overrided by procces.env["{appName}.options.identity.enabled"]
     */
    enabled: boolean;

    /**
     * the type of User
     * the default value is FultonUser
     */
    userType: Type<IUser>;

    /**
     * the instance or type of User Repository
     * the default value is typeorm Repository
     */
    userRepository: Type<Repository<IUser>> | Repository<IUser>;

    /**
     * the instance or type of UserService
     * the default value is FultonUserService
     * it can be used like
     * `req.userService`
     * 
     * if your user schema is like FultonUser and auth strategies is
     * usernamn-password and bearer token, then you don't need to change this value,
     * otherwise you have to custom your user service;
     */
    userService: Type<IUserService<IUser>> | IUserService<IUser>;

    /**
     * access token duratio in seconds
     * 
     * default is a mouth = 2,592,000
     */
    accessTokenDuration: number;

    /**
     * access token type
     * default is bearer, it affect authenticate method for every in coming request
     */
    accessTokenType: string;

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
    defaultAuthenticateErrorIfFailure: boolean;

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
     *     // authorize by admin role and loggined
     *     @httpDelete("/:id", authorizeByRole("admin")) 
     *     delete(req: Request, res: Response) { }
     * }
     * ```
     */
    defaultAuthorizes: Middleware[];

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
     *     // you can set options.identity.register.endabled = false
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
    register: {
        /**
         * the default value is true
         */
        enabled?: boolean;

        /**
         * the default value is /auth/login
         */
        path?: PathIdentifier;

        /**
         * the default value is `post`
         */
        httpMethod?: HttpMethod;

        /**
         * the default value email
         */
        emailField?: string;

        /**
         * the default value username
         */
        usernameField?: string;

        /**
         * the default value password
         */
        passwordField?: string;

        /**
         * the options for hash password
         */
        passwordHashOptons?: {
            /** 
             * the default value is sha256
             */
            algorithm?: string;
            /**
             * the default value is 8
             */
            saltLength?: number;
            /**
             * the default value is 1
             */
            iterations?: number;
        }

        session?: boolean;

        /**
         * accept other fields, like nickname or phonenumber
         * the default value is empty
         */
        otherFileds?: string[];

        /**
         * verify password is vaild or not
         * the default value is /^[a-zA-Z0-9_-]{4,64}$/
         */
        usernameVerifier?: RegExp | ((username: string) => boolean);

        /**
         * verify password is vaild or not
         * the default value is /^\S{6,64}$/, any 4 to 64 non-whitespace characters
         */
        passwordVerifier?: RegExp | ((pw: string) => boolean);

        /**
         * the handler for register
         * the default value is fultonDefaultRegisterHandler
         */
        handler?: Middleware;

        /**
         * either use successCallback or responseOptions for response
         * the default value is sendAccessToken
         */
        successCallback?: Middleware;

        /**
         */
        responseOptions?: AuthenticateOptions;
    }

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
     *     // you can set options.identity.login.endabled = false
     *     // and add this action.
     *     @httpPost("/login", authenticate("local", { failureRedirect: "/auth/login" }))
     *     login(req: Request, res: Response) {
     *         res.redirect("/");
     *     }
     * }
     * ```
     */
    login: {
        /**
         * the default value is true
         * it can be overrided by procces.env["{appName}.options.identity.login.enabled"]
         */
        enabled?: boolean;

        /**
         * the default value is /auth/login
         */
        path?: PathIdentifier;

        /**
         * the default value is `post`
         */
        httpMethod?: HttpMethod;

        /**
         * the default value username
         */
        usernameField?: string;

        /**
         * the default value password
         */
        passwordField?: string;

        /**
         * the function to find the user
         * 
         * the default value is FultonImpl.localStrategyVerifier
         * 
         * ### customzing example
         * verifier = (req: Request, username: string, password: string, done: LocalStrategyVerifyDone) => {
         *     req.userService
         *         .login(username, password)
         *         .then((user) => {
         *             done(null, user);
         *         }).catch((error) => {
         *             done(error);
         *         });
         * }
         */
        verifier?: LocalStrategyVerifier;

        /**
         * the middleware next to authenticate
         * the default value is FultonImpl.successMiddleware
         */
        successMiddleware?: Middleware;

        /**
         * 
         */
        authenticateOptions?: AuthenticateOptions
    }

    bearer: {
        /**
         * default is true
         * it can be overrided by procces.env["{appName}.options.identity.bearer.enabled"]
         */
        enabled?: boolean;

        /**
         * the function to find the user
         * 
         * ### default value is
         * async function fultonTokenStrategyVerify(req: Request, token: string, done: StrategyVerifyDone) {
         *     if (!token) {
         *         done(null, false);
         *     }
         * 
         *     let user = await req.userService.findByAccessToken(token);
         * 
         *     if (user) {
         *         return done(null, user);
         *     } else {
         *         return done(null, false);
         *     }
         * }
         */
        verifier?: TokenStrategyVerifier;
    }

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
     * clientId can be overrided by procces.env["{appName}.options.identity.google.clientId"]
     * clientSecret can be overrided by procces.env["{appName}.options.identity.google.clientSecret"]
     */
    google: GoogleStrategyOptions;

    /**
     * pre-defined github strategy
     * path is `/auth/github`
     * callback is `/auth/github/callback`
     * scope is `profile email`
     * 
     * ## Require "passport-github" package ##
     * run `npm install passport-github` to install it
     * 
     * clientId can be overrided by procces.env["{appName}.options.identity.github.clientId"]
     * clientSecret can be overrided by procces.env["{appName}.options.identity.github.clientSecret"]
     */
    github: OAuthStrategyOptions;

    /** other passport stratogies */
    readonly strategies: CustomStrategySettings[] = [];

    /**
     * the strategies will be used by defaultAuthenticate. like bearer
     */
    readonly defaultAuthSupportStrategies: string[] = [];

    constructor(private appName: string, private appModel: AppMode) {
        this.enabled = false;

        this.userType = FultonUser;
        this.userService = FultonUserService;

        this.defaultAuthorizes = [];
        this.accessTokenDuration = 2592000;
        this.accessTokenType = "bearer";

        this.defaultAuthenticate = FultonImpl.defaultAuthenticate;
        this.defaultAuthenticateErrorIfFailure = false;

        this.register = {
            enabled: true,
            path: "/auth/register",
            httpMethod: "post",
            usernameField: "username",
            passwordField: "password",
            emailField: "email",
            usernameVerifier: /^[a-zA-Z0-9_-]{4,64}$/,
            passwordVerifier: /\S{6,64}/,
            passwordHashOptons: {
                algorithm: "sha256"
            },
            session: false,
            otherFileds: [],
            handler: FultonImpl.registerHandler,
            successCallback: FultonImpl.successMiddleware
        };

        this.login = {
            enabled: true,
            path: "/auth/login",
            httpMethod: "post",
            verifier: FultonImpl.localStrategyVerifier,
            successMiddleware: FultonImpl.successMiddleware
        };

        this.bearer = {
            verifier: FultonImpl.tokenStrategyVerifier
        }

        this.google = {
            enabled: false,
            path: "/auth/google",
            callbackPath: "/auth/google/callback",
            accessType: "online",
            scope: "profile email",
            strategyOptions: {},
            verifierFn: FultonImpl.oauthVerifierFn,
            authenticateFn: FultonImpl.oauthAuthenticateFn,
            callbackAuthenticateFn: FultonImpl.oauthCallbackAuthenticateFn
        }

        this.github = {
            enabled: false,
            path: "/auth/github",
            callbackPath: "/auth/github/callback",
            scope: "read:user user:email",
            strategyOptions: {},
            verifierFn: FultonImpl.oauthVerifierFn,
            authenticateFn: FultonImpl.oauthAuthenticateFn,
            callbackAuthenticateFn: FultonImpl.oauthCallbackAuthenticateFn
        }

        if (this.appModel == "api") {
            this.bearer.enabled = true;
        } else if (this.appModel == "web-view") {
            this.bearer.enabled = false;
            this.register.responseOptions = {
                failureRedirect: "/auth/register",
                successRedirect: "/"
            };

            this.login.authenticateOptions = {
                failureRedirect: "/auth/login",
                successRedirect: "/"
            };

            this.google.callbackAuthenticateOptions = {
                failureRedirect: "/auth/login",
                successRedirect: "/"
            }

            this.github.callbackAuthenticateOptions = {
                failureRedirect: "/auth/login",
                successRedirect: "/"
            }
        }
    }

    /**
     * load options from environment to override the current options 
     */
    loadEnvOptions() {
        let prefix = `${this.appName}.options.identity`;

        let envValues = {
            enabled: Env.getBoolean(`${prefix}.enabled`),
            register: {
                enabled: Env.getBoolean(`${prefix}.register.enabled`)
            },
            login: {
                enabled: Env.getBoolean(`${prefix}.login.enabled`)
            },
            bearer: {
                enabled: Env.getBoolean(`${prefix}.login.enabled`)
            },
            google: {
                enabled: Env.getBoolean(`${prefix}.google.enabled`),
                clientId: Env.get(`${prefix}.google.clientId`),
                clientSecret: Env.get(`${prefix}.google.clientSecret`)
            },
            github: {
                enabled: Env.getBoolean(`${prefix}.github.enabled`),
                clientId: Env.get(`${prefix}.github.clientId`),
                clientSecret: Env.get(`${prefix}.github.clientSecret`)
            }
        } as IdentityOptions;

        let customer = (a: any, b: any): any => {
            if (typeof a == "object") {
                return lodash.assignWith(a, b, customer);
            } else {
                return b == null ? a : b;
            }
        }

        lodash.assignWith(this, envValues, customer);
    }

    useDefaultImplement(): boolean {
        return this.enabled &&
            (this.userType == FultonUser) &&
            (this.userRepository == null) &&
            (this.userService == FultonUserService)
    }

    addStrategy(options: StrategyOptions | OAuthStrategyOptions, strategy: Strategy | Type<Strategy>) {
        options.enabled = options.enabled == null ? true : options.enabled;

        this.strategies.push({
            options: options,
            strategy: strategy
        });
    }
}