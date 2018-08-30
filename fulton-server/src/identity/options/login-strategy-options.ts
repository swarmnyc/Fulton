import { AuthenticateOptions, LocalStrategyVerifier } from '../interfaces';
import { BaseOptions } from '../../options/options';
import { Env } from '../../helpers';
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
     * the try limit for failure,
     * the default value is 3
     */
    tryLimit?: number = 3;

    /**
     * if users try login over the tryLimits, than lock for the given time.
     * the default value is 10 seconds, not long because it only punishes bots. 
     */
    lockTime?: number = 10_000

    /**
     * the function to find the user
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