import { BaseOptions } from '../../options/options';

export class AccessTokenOptions extends BaseOptions<AccessTokenOptions> {
    /**
     * the type of access token
     * default is bearer, it affect authenticate method for every in coming request
     */
    type?: string = "bearer";

    /**
     * the duration of access token in milliseconds
     * 
     * default is 30 days = 2,592,000,000
     */
    duration?: number = 2_592_000_000;

    /**
     * the scopes of access token, for examples, username, rolus, email
     * default is "[]"
     */
    scopes?: string[] = [];

    /**
     * the secret for JWT Token
     * default is app_name
     */
    secret?: string = this.appName;
}