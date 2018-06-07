import { FultonAccessToken, FultonIdentity, FultonUser } from './fulton-user';
import { FultonIdentityImpl } from './fulton-impl';
import { FultonUserService } from './fulton-user-service';
import { IFultonApp } from '../../fulton-app';
import { OauthStrategyOptions } from '../options/oauth-strategy-options';

/**
 * Initialize Identity to use FultonImpl if app.options.identity.userService is null
 * Why? if the identity.enabled = false, this file and fulton-impl won't be called
 * so, lots of packages can be not installed, like passport
 */
module.exports = async function (app: IFultonApp) {
    let idOptions = app.options.identity;

    if (idOptions.userService == null) {
        idOptions.userService = FultonUserService

        app.options.entities.push(FultonUser, FultonAccessToken, FultonIdentity)
    }

    if (idOptions.defaultAuthenticate == null) {
        idOptions.defaultAuthenticate = FultonIdentityImpl.defaultAuthenticate;
    }

    if (idOptions.register.handler == null) {
        idOptions.register.handler = FultonIdentityImpl.registerHandler;
    }

    if (idOptions.register.successCallback == null) {
        idOptions.register.successCallback = FultonIdentityImpl.issueAccessToken;
    }

    if (idOptions.login.verifier == null) {
        idOptions.login.verifier = FultonIdentityImpl.localStrategyVerifier;
    }

    if (idOptions.login.successMiddleware == null) {
        idOptions.login.successMiddleware = FultonIdentityImpl.issueAccessToken;
    }

    if (idOptions.forgotPassword.handler == null) {
        idOptions.forgotPassword.handler = FultonIdentityImpl.forgotPasswordHandler;
    }

    if (idOptions.bearer.verifier == null) {
        idOptions.bearer.verifier = FultonIdentityImpl.tokenStrategyVerifier;
    }

    let oauthOptions: OauthStrategyOptions[] = [
        idOptions.google,
        idOptions.facebook,
        idOptions.github
    ]

    oauthOptions.forEach((opts) => {
        if (opts.verifierFn == null) {
            opts.verifierFn = FultonIdentityImpl.oauthVerifierFn;
        }

        if (opts.authenticateFn == null) {
            opts.authenticateFn = FultonIdentityImpl.oauthAuthenticateFn;
        }

        if (opts.callbackAuthenticateFn == null) {
            opts.callbackAuthenticateFn = FultonIdentityImpl.oauthCallbackAuthenticateFn;
        }
    })
}