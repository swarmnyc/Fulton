import { FultonAccessToken, FultonIdentity, FultonUser } from './fulton-user';
import { FultonUserService } from './fulton-user-service';
import { IFultonApp } from '../../fulton-app';

/**
 * Initialize Identity to use FultonImpl if app.options.identity.userService is null
 */
module.exports = async function (app: IFultonApp) {
    let idOptions = app.options.identity;

    idOptions.userService = FultonUserService

    app.options.entities.push(FultonUser, FultonAccessToken, FultonIdentity)
}