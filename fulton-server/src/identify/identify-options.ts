import { AppMode, HttpMethod, PathIdentifier } from "../interfaces";
import { FultonUser, FultonUserService, IUser, Middleware, Type } from "../index";
import { IUserService, LocalStrategyVerify, TokenStrategyVerify } from "./interfaces";
import {
    fultonDefaultAuthenticateHandler,
    fultonDefaultRegisterHandler,
    fultonDefaultStategySuccessHandler,
    fultonLocalStrategyVerify,
    fultonTokenStrategyVerify
} from "./fulton-impl/fulton-middlewares";

import { AuthorizeOptions } from "./authorizes-middlewares";
import Env from "../helpers/env";
import { Repository } from "typeorm";
import { Strategy } from "passport";

export class IdentifyOptions {
    /**
     * the default value is false
     * It can be overrided by procces.env["{appName}.options.identify.enabled"]
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
     * for api mode, default is true
     * ```
     * app.use((req, res, next) => {
     *     // authenticate every request to get user info.
     *     passport.authenticate(enabledStrategies, { session: false }, function (error, user, info) {
     *         if (error) {
     *             return next(error);
     *         }
     *         
     *         if(!user && defaultAuthenticateErrorIfFailure){
     *              return res.sendStatus(401)
     *         }
     * 
     *         next();
     *     })(req, res, next);
     * });
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
     * @Router("/Food", authorize())
     * export class FoodRouter extends FultonRouter {
     *     // all actions needs to be authorized
     *     @HttpGet()
     *     list(req: Request, res: Response) { }  
     *    
     *     @HttpGet("/:id")
     *     detail(req: Request, res: Response) { }
     * } 
     * 
     * @Router("/Food")
     * export class FoodRouter extends FultonRouter {
     *     // no authorize
     *     @HttpGet() 
     *     list(req: Request, res: Response) { }     
     * 
     *     // action level authorization
     *     // authorize by admin role and loggined
     *     @HttpDelete("/:id", authorizeByRole("admin")) 
     *     delete(req: Request, res: Response) { }
     * }
     * ```
     */
    defaultAuthorizes: Middleware[]

    /**
     * the local strategy for login, fulton doesn't have html for login, 
     * 
     * for render html, you have to add a router
     * 
     * ## example for web view
     * ```
     * @Router("/auth")
     * export class AuthRouter extends FultonRouter {
     *     @HttpGet("/login")
     *     loginView(req: Request, res: Response) {
     *         res.render("login");
     *     }
     * 
     *     // if you want to all logics altogether
     *     // you can set options.identify.login.endabled = false
     *     // and add this action.
     *     @HttpPost("/login", authenticate("local", { failureRedirect: "/auth/login" }))
     *     login(req: Request, res: Response) {
     *         res.redirect("/");
     *     }
     * }
     * ```
     */
    login: {
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
         * ### default value is
         * async function fultonLocalStrategyVerify(req: Request, username: string, password: string, done: LocalStrategyVerifyDone) {
         *     if (!username || !password) {
         *         done(null, false);
         *     }
         * 
         *     let user = await req.userService.find(username, password) as FultonUser;
         * 
         *     if (user && passwordHash.verify(password, user.hashedPassword)) {
         *         return done(null, user);
         *     } else {
         *         return done(null, false);
         *     }
         * }
         */
        verify?: LocalStrategyVerify;

        /**
         * the handler for authenticating successfully for api mode
         * the default value is sendAccessToken
         */
        apiSuccessHandler?: Middleware;

        /**
         * the options for web-viwe mode
         */
        webViewOptions?: {
            /**
             * the default value is /
             */
            successRedirect?: string;

            /**
             * the default value is /auth/login
             */
            failureRedirect?: string;

            /**
             * the default value is false
             */
            failureFlash?: string | boolean;

            /**
             * the default value is Login Failed
             */
            failureMessage?: string;
        }
    }

    /**
     * the setting for register, fulton doesn't have html for register, 
     * 
     * for render html, you have to add a router
     * 
     * ## example for web view
     * ```
     * @Router("/auth")
     * export class AuthRouter extends FultonRouter {
     *     @HttpGet("/register")
     *     registerView(req: Request, res: Response) {
     *         res.render("register");
     *     }
     * 
     *     // if you want to put all logics altogether
     *     // you can set options.identify.register.endabled = false
     *     // and add this action.
     *     @HttpPost("/register"))
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
         * the handler for register
         * the default value is fultonDefaultRegisterHandler
         */
        handler?: Middleware;

        /**
         * the options for web-viwe mode
         */
        webViewOptions?: {
            /**
             * the default value is /
             */
            successRedirect?: string;

            /**
             * the default value is /auth/register
             */
            failureRedirect?: string;

            /**
             * the default value is false
             */
            failureFlash?: string | boolean;

            /**
             * the default value is empty
             */
            failureMessage?: string;
        }
    }

    bearer: {
        /**
         * default is true
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
        verify?: TokenStrategyVerify;
    }

    google: {
        enabled: boolean;
        path: PathIdentifier;
        callbackPath: PathIdentifier;
    }

    // TODO: other strategies, like facebook, github

    /** other passport stratogies */
    strategies: Strategy[];

    /**
     * the eanbled strategies, the values will be inserted after initilization.
     */
    readonly enabledStrategies: string[] = [];

    constructor(private appName: string, private appModel: AppMode) {
        this.enabled = false;

        this.userType = FultonUser;
        this.userService = FultonUserService;

        this.defaultAuthorizes = [];
        this.accessTokenDuration = 2592000;
        this.accessTokenType = "bearer";

        this.defaultAuthenticate = fultonDefaultAuthenticateHandler;
        this.defaultAuthenticateErrorIfFailure = false;

        this.login = {
            enabled: true,
            path: "/auth/login",
            httpMethod: "post",
            usernameField: "username",
            passwordField: "password",
            verify: fultonLocalStrategyVerify,
            webViewOptions: {
                failureRedirect: "/auth/login",
                successRedirect: "/"
            },
            apiSuccessHandler: fultonDefaultStategySuccessHandler
        };

        this.register = {
            enabled: true,
            path: "/auth/register",
            httpMethod: "post",
            usernameField: "username",
            passwordField: "password",
            emailField: "email",
            webViewOptions: {
                failureRedirect: "/auth/register",
                successRedirect: "/"
            },
            handler: fultonDefaultRegisterHandler
        };

        this.bearer = {
            verify: fultonTokenStrategyVerify
        }

        if (this.appModel == "api") {
            this.bearer.enabled = true;
        } else {
            this.bearer.enabled = false;
        }
    }

    /**
     * load options from environment to override the current options 
     */
    loadEnvOptions() {
        let prefix = `${this.appName}.options.identify`;
        // TODO: identify loadEnvOptions
        this.enabled = Env.getBoolean(`${prefix}.enabled`, this.enabled);
    }

    useDefaultImplement(): boolean {
        return this.enabled &&
            (this.userType == FultonUser) &&
            (this.userRepository == null) &&
            (this.userService == FultonUserService)
    }
}