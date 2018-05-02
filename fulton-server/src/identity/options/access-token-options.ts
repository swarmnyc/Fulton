import { BaseOptions } from '../../options/options';

export class AccessTokenOptions extends BaseOptions<AccessTokenOptions> {
    /**
     * the type of access token
     * default is bearer, it affect authenticate method for every in coming request
     */
    type?: string = "bearer";

    /**
     * the duration of access token in seconds
     * 
     * default is a mouth = 2,592,000
     */
    duration?: number = 2592000;

    /**
     * the scopes of access token, for examples, username, rolus, emails
     * default is "[]"
     */
    scopes?: string[] = [];

    /**
     * the secret for JWT Token
     * default is app_name
     */
    secret?: string = this.appName;
}