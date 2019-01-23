import { HttpMethod, PathIdentifier } from '../../types';
import { BaseOptions } from '../../options/options';
import { AuthenticateOptions, StrategyVerifier } from '../types';

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
     * the verifier is for passport strategy.
     */
    verifier?: StrategyVerifier;

    /**
     * if provided, call this function to get the verifier
     */
    verifierFn?: (options: StrategyOptions) => StrategyVerifier;

    /**
     * the options to pass to passport when call passport.authenticate()
     */
    authenticateOptions?: AuthenticateOptions = {};

    /**
     * if true, add to defaultAuthenticate support list. which means this strategy will be called by every incoming requests.
     * the default value is false.
     */
    addToDefaultAuthenticateList?: boolean;
}