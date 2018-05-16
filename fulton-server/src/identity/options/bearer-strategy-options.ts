import { Env } from '../../helpers';
import { StrategyOptions } from './strategy-options';
import { TokenStrategyVerifier } from '../interfaces';

/**
 * options for passport bearer stragery
 */
export class BearerStrategyOptions extends StrategyOptions {
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

    constructor(protected appName?: string, protected appMode?: string, protected type?: string) {
        super(appName, appMode);

        this.enabled = true;
        this.addToDefaultAuthenticateList = true;

    }

    init?(): void {
        this.enabled = Env.getBoolean(`${this.appName}.options.identity.bearer.enabled`, this.enabled);
    }
}