import { AuthenticateOptions, LocalStrategyVerifier, StrategyVerifier } from '../interfaces';
import { BaseOptions } from '../../options/options';
import { HttpMethod, Middleware, PathIdentifier } from '../../interfaces';

export class StrategyOptions extends BaseOptions<StrategyOptions> {
    /**
     * default is false
     * it can be overridden by process.env["{appName}.options.identity.{type}.enabled"]
     */
    enabled?: boolean;

    /**
     * strategy name, if undefined, use Strategy.Name
     */
    name?: string;

    /**
     * the default value is get
     */
    httpMethod?: HttpMethod;

    /**
     * the route path for example /auth/google
     */
    path?: PathIdentifier;

    /**
    * for passport, use it when create new Strategy object, like
    * new LocalStrategy(options.strategyOptions, options.verifier)
    */
    strategyOptions?: { [key: string]: any } = {};

    /**
     * verify the oauth request.
     */
    verifier?: StrategyVerifier | LocalStrategyVerifier | any;

    /**
     * the middleware next to authenticate
     * the default value is null
     */
    successMiddleware?: Middleware;

    /**
     * the options to pass to passport when call passport.authenticate()
     */
    authenticateOptions?: AuthenticateOptions = {};

    /**
      * if provided,call this function to get the middleware, like
     * app.use(options.authenticateFn(options))
     * 
     * otherwise use
     * app.use(passport.authenticate(options.name, options.authenticateOptions))
     */
    authenticateFn?: (options: StrategyOptions) => Middleware

    /**
     * if true, add to defaultAuthenticate support list. which means this strategy will be called by every incoming requests.
     * the default value is false.
     */
    addToDefaultAuthenticateList?: boolean;
}