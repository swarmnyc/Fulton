import { PathIdentifier, HttpMethod } from "../interfaces";
import { LocalStrategyVerify, IUserService, TokenStrategyVerify } from "./interfaces";
import { Strategy } from "passport";
import { Middleware, FultonUserService, Type } from "../index";
import Env from "../helpers/env";
import { AuthorizeOptions } from "./authorizes-middlewares";
import { fultonLocalStrategyVerify, fultonStrategyResponse, fultonTokenStrategyVerify } from "./fulton-impl/fulton-middlewares";

export class IdentifyOptions {
    /**
     * the default value is false
     * It can be overrided by procces.env["{appName}.options.identify.enabled"]
     */
    enabled: boolean;

    /**
     * the type of UserService
     * the default value is FultonUserService
     * it can be used like
     * `req.userService`
     * for all middlewares
     */
    userService: Type<IUserService>;

    /**
     * access token Expiration time in millseconds
     * 
     * default is a mouth = 2,592,000,000 
     */
    accessTokenExpirationMs: number;

    /**
     * access token type
     * default is bearer, it affect authenticate method for every in coming request
     */
    accessTokenType: string;

    /**
     * the authenticate method
     * if it is in api mode, it based on accessTokenType.
     * if it is in web-mode, the value is empty.
     */
    authenticates: Middleware[]

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
     * the local strategy, there is no web view for it, 
     * 
     * for web mode, you have to add a router for it
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
     *     // you can set options.identify.local.endabled = false
     *     // and add this action.
     *     @HttpPost("/login", authenticate("local", { failureRedirect: "/auth/login" }))
     *     login(req: Request, res: Response) {
     *         res.redirect("/");
     *     }
     * }
     * ```
     */
    local: {
        /**
         * the default value is true
         */
        enabled?: boolean;

        /**
         * the default value is /auth/login
         */
        path?: PathIdentifier;

        /**
         * the default value is post
         */
        httpMethod?: HttpMethod;

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
         * defualt value is
         * 
         * if it is in api mode
         * it return the access token
         * 
         * if
         * the default value is redirectMiddleware
         */
        response?: Middleware;

        /**
         * for web-viwe mode
         * the default value is /
         */
        successRedirect?: string;

        /**
         * for web-viwe mode
         * the default value is /auth/login
         */
        failureRedirect?: string;
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

    constructor(private appName: string) {
        this.enabled = false;

        this.userService = FultonUserService;
        this.defaultAuthorizes = [];
        this.accessTokenExpirationMs = 2592000000;

        this.local = {
            enabled: true,
            path: "/auth/login",
            httpMethod: "post",
            verify: fultonLocalStrategyVerify,
            failureRedirect: "/auth/login",
            successRedirect: "/"
        }

        this.local.response = fultonStrategyResponse(this.local);

        this.bearer = {
            enabled: true,
            verify: fultonTokenStrategyVerify
        }
    }

    /**
     * load options from environment to override the current options 
     */
    loadEnvOptions() {
        let prefix = `${this.appName}.options.identify`;

        this.enabled = Env.getBoolean(`${prefix}.enabled`, this.enabled);

        this.userService = FultonUserService;
    }
}