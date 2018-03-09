import { IStrategyOptionsWithRequest, Strategy as LocalStrategy } from 'passport-local';
import { Request, Response } from "../interfaces";

import { AccessToken } from './interfaces';
import { FultonApp } from "../fulton-app";
import { FultonAppOptions } from "../fulton-app-options";
import { FultonImpl } from './fulton-impl/fulton-impl';
import { GoogleStrategy } from "./strategies/google-strategy";
import { HttpTester } from "../helpers/http-tester";
import { UserServiceMock } from "../../spec/helpers/user-service-mock";

class MyApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void | Promise<void> {
        this.options.identity.enabled = true;
        this.options.identity.userService = new UserServiceMock(this);
        this.options.identity.login.enabled = false;
        this.options.identity.register.enabled = false;
        this.options.identity.bearer.enabled = false;

        this.options.identity.addStrategy({
            name: "login",
            path: "/test/login",
            httpMethod: "post",
            verifier: FultonImpl.localStrategyVerifier,
            successMiddleware: FultonImpl.issueAccessToken
        }, LocalStrategy);

        this.options.identity.addStrategy({
            path: "/test/google",
            callbackPath: "/test/google/callback",
            scope: "profile email",
            clientId: "test",
            clientSecret: "test",
            verifierFn: FultonImpl.oauthVerifierFn,
            authenticateFn: FultonImpl.oauthAuthenticateFn,
            callbackAuthenticateFn: FultonImpl.oauthCallbackAuthenticateFn
        }, GoogleStrategy);

        this.options.identity.addStrategy({
            path: "/test/github",
            callbackPath: "/test/github/callback",
            scope: "read:user user:email",
            strategyOptions: {
                clientID: "test",
                clientSecret: "test"
            },
            verifierFn: FultonImpl.oauthVerifierFn,
            authenticateFn: FultonImpl.oauthAuthenticateFn,
            callbackAuthenticateOptions: {
                successRedirect: "/"
            },
            callbackAuthenticateFn: FultonImpl.oauthCallbackAuthenticateFn
        }, require("passport-github").Strategy);
    }
}

// launch web server to test
describe('Identity Custom Strategies', () => {
    let app: MyApp;
    let httpTester: HttpTester;

    beforeEach(() => {
        httpTester.setHeaders(null);
    })

    beforeAll(() => {
        app = new MyApp();
        httpTester = new HttpTester(app);
        return httpTester.start();
    });

    afterAll(async () => {
        return httpTester.stop();
    });

    it('should custom login strategy work', async () => {
        let result = await httpTester.post("/test/login", {
            username: "test",
            password: "test"
        })

        let at: AccessToken = result.body;
        expect(at.access_token).toEqual("test-accessToken");
        expect(at.expires_in).toEqual(2592000);
    });

    it('should custom google strategy work', async () => {
        // should redirect        
        let result1 = await httpTester.get("/test/google", null, false);
        expect(result1.response.headers.location).toContain("https://accounts.google.com/o/oauth2/v2/auth");

        // should parse the code
        let axios = require("axios");
        let fakeToken = {
            "access_token": "ya29.GmFPBQC7v1zToRKWCc5XD9qdqdnv090ZT2Grk",
            "token_type": "Bearer",
            "id_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoidGVzdCIsImVtYWlsIjoidGVzdEBnbWFpbC5jb20ifQ.9WpSTovz4JOgt_Sm4U9oNwplBENjIhyJcTLPM3yIk2Y",
            "expiry_date": 1517087460847
        };

        spyOn(axios, "default").and.returnValue(Promise.resolve({ data: fakeToken }));
        let result2 = await httpTester.get("/test/google/callback?code=test");

        let at: AccessToken = result2.body;
        expect(at.access_token).toEqual("test@gmail.com-accessToken");
    });

    it('should github oauth login', async () => {
        // should redirect        
        let result1 = await httpTester.get("/test/github", null, false);
        expect(result1.response.headers.location).toContain("https://github.com/login/oauth/authorize");

        //should parse the code
        let oauth2 = require("oauth").OAuth2;

        spyOn(oauth2.prototype, "_request").and.callFake((method: any, url: string, headers: any, post_body: any, access_token: any, callback: any) => {
            if (url.startsWith("https://github.com/login/oauth/access_token")) {
                callback(null, "access_token=0a19c6216599daf812a601d78164b17e60b61be4&scope=read%3Auser%2Cuser%3Aemail&token_type=bearer")
            } else if (url.startsWith("https://api.github.com/user/emails")) {
                callback(null, `[]`)
            } else {
                callback(null, `{"login":"test","name":"test","email":"test@test.com"}`)
            }
        });

        let result2 = await httpTester.get("/test/github/callback?code=test", null, false);
        expect(result2.response.headers.location).toEqual("/");
    });
});