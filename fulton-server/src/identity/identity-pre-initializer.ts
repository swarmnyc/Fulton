import { IFultonApp } from '../fulton-app';
import { FultonIdentityRouter } from './fulton-impl/fulton-identity-router';
import { FultonUserAccessToken, FultonUserClaims, FultonUser } from './fulton-impl/fulton-user';
import { FultonUserService } from './fulton-impl/fulton-user-service';
import * as passport from 'passport';

/**
 * Pre Initialize Identity
 * because entities have to be initialized first, so there are two Identity, one before database, one after middleware
 */
module.exports = async function (app: IFultonApp) {
    let idOptions = app.options.identity;

    if (idOptions.userService == null) {
        idOptions.userService = FultonUserService

        app.options.entities.push(FultonUser, FultonUserAccessToken, FultonUserClaims)
    }

    if (idOptions.router == null) {
        idOptions.router = FultonIdentityRouter
    }
}