import { IFultonApp } from '../fulton-app';
import { FultonIdentityRouter } from './fulton-impl/fulton-identity-router';
import { FultonUserService } from './fulton-impl/fulton-user-service';
import { defaultBearerStrategyVerifier, defaultLoginStrategyVerifier, defaultOauthStrategyVerifierFn } from "./identity-defaults";
import { FultonUserClaims, FultonUserAccessToken, FultonUser } from "./fulton-impl/fulton-user";

/**
 * Pre Initialize Identity
 * because entities have to be initialized first, so there are two Identity, one before database, one after middleware
 */
module.exports = async function (app: IFultonApp) {
    let opts = app.options.identity;

    if (opts.userService == null) {
        opts.userService = FultonUserService

        // add default entities, typeorm needs them to works
        if (opts.userEntity == null) {
            opts.userEntity = FultonUser
        }

        app.options.entities.push(opts.userEntity, FultonUserClaims, FultonUserAccessToken);
    }

    if (opts.router == null) {
        opts.router = FultonIdentityRouter
    }

    // init passport Strategies
    // add pre-defined login strategy
    if (opts.login.enabled) {
        if (opts.login.verifier == null && opts.login.verifierFn == null) {
            opts.login.verifier = defaultLoginStrategyVerifier
        }

        opts.addStrategy(opts.login, require("passport-local").Strategy);
    }

    // add pre-defined bearer strategy
    if (opts.bearer.enabled) {
        if (opts.bearer.verifier == null && opts.bearer.verifierFn == null) {
            opts.bearer.verifier = defaultBearerStrategyVerifier
        }

        opts.addStrategy(opts.bearer, require("passport-http-bearer").Strategy);
    }

    // add pre-defined google strategy
    if (opts.google.enabled) {
        if (opts.google.verifier == null && opts.google.verifierFn == null) {
            opts.google.verifierFn = defaultOauthStrategyVerifierFn
        }

        opts.addStrategy(opts.google, require('./strategies/google-strategy').GoogleStrategy)
    }

    // add pre-defined github strategy
    if (opts.github.enabled) {
        if (opts.github.verifier == null && opts.github.verifierFn == null) {
            opts.github.verifierFn = defaultOauthStrategyVerifierFn
        }

        opts.addStrategy(opts.github, require("passport-github").Strategy)
    }

    // add pre-defined github strategy
    if (opts.facebook.enabled) {
        if (opts.facebook.verifier == null && opts.facebook.verifierFn == null) {
            opts.facebook.verifierFn = defaultOauthStrategyVerifierFn
        }

        opts.addStrategy(opts.facebook, require("passport-facebook").Strategy)
    }
}