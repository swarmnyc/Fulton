import * as lodash from 'lodash';

import { FultonUser } from "./fulton-user";
import { LocalStrategyVerifyDone, StrategyResponseOptions, StrategyVerifyDone } from "../interfaces";
import { Request } from "../../interfaces";

import * as passwordHash from 'password-hash';
import { Middleware, Response, FultonApp } from '../../index';

export async function fultonLocalStrategyVerify(req: Request, username: string, password: string, done: LocalStrategyVerifyDone) {
    if (!username || !password) {
        done(null, false);
    }

    let user = await req.userService.login(username, password) as FultonUser;

    if (user && passwordHash.verify(password, user.hashedPassword)) {
        return done(null, user);
    } else {
        return done(null, false);
    }
}

export async function fultonTokenStrategyVerify(req: Request, token: string, done: StrategyVerifyDone) {
    if (!token) {
        done(null, false);
    }

    let user = await req.userService.findByAccessToken(token);

    if (user) {
        return done(null, user);
    } else {
        return done(null, false);
    }
}

export function fultonStrategyResponse(options: StrategyResponseOptions): Middleware {
    return async function (req: Request, res: Response) {
        let app = req.app.locals.fulton as FultonApp;
        if (app.options.mode == "api") {
            // after login, access token will be put on res.locals.accessToken
            return res.locals.accessToken;
        } else {
            res.redirect(options.successRedirect);
        }
    }
}