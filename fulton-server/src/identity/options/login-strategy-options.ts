import { AuthenticateOptions, LocalStrategyVerifier } from '../interfaces';
import { BaseOptions } from '../../options/options';
import { Env } from '../../helpers';
import { FultonIdentityImpl } from '../fulton-impl/fulton-impl';
import { HttpMethod, Middleware, PathIdentifier } from '../../interfaces';
import { StrategyOptions } from './strategy-options';
import * as lodash from 'lodash';

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
export class LoginStrategyOptions extends StrategyOptions {
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
     * the default value is FultonIdentityImpl.localStrategyVerifier
     * 
     * ### customizing example
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

    constructor(protected appName?: string, protected appMode?: string, protected type?: string) {
        super(appName, appMode);

        this.enabled = true;
        this.path = "/auth/login";
        this.httpMethod = "post";

        this.verifier = FultonIdentityImpl.localStrategyVerifier;
        this.successMiddleware = FultonIdentityImpl.issueAccessToken;
    }

    init?(): void {
        this.enabled = Env.getBoolean(`${this.appName}.options.identity.login.enabled`, this.enabled)

        if (this.appMode == "web-view" && this.authenticateOptions == null) {
            this.authenticateOptions = {
                failureRedirect: "/auth/login",
                successRedirect: "/"
            };
        }

        lodash.defaults(this.strategyOptions, {
            usernameField: this.usernameField,
            passwordField: this.passwordField
        });
    }
}