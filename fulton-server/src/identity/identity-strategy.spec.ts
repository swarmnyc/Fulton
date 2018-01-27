import { FultonApp } from "../fulton-app";
import { FultonAppOptions } from "../fulton-app-options";
import { IStrategyOptionsWithRequest, Strategy as LocalStrategy } from 'passport-local';
import { HttpTester } from "../../spec/helpers/http-tester";
import { AccessToken, authorize, authorizeByRole, authorizeByRoles, Router, HttpGet, Request, Response, FultonRouter, FultonImpl } from "../index";
import { UserServiceMock } from "../../spec/helpers/user-service-mock";
import { GoogleStrategy } from "./strategies/google-strategy";

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
                successMiddleware: FultonImpl.successMiddleware
            }, LocalStrategy);

        this.options.identity.addStrategy({
            path: "/test/google",
            callbackPath: "/test/google/callback",
            scope: "profile email",
            clientId: "test",
            clientSecret: "test",
            verifierFn: FultonImpl.oauthVerifierFn,
            authenticateFn: FultonImpl.oauthAuthenticateFn,
            authenticateOptions: {
                failureRedirect: "/test/login",
            },
            callbackAuthenticateFn: FultonImpl.oauthCallbackAuthenticateFn
        }, GoogleStrategy);
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
        let result = await httpTester.postJson("/test/login", {
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
            "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjI2YzAxOGIyMzNmZTJlZWY0N2ZlZGJiZGQ5Mzk4MTcwZmM5YjI5ZDgifQ.eyJhenAiOiIyOTE1MTA3MzU1MzktcmJuM2tmbDk0aWM5dHNhOHJoYW1oY3E1OHNkbGE3MGIuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIyOTE1MTA3MzU1MzktcmJuM2tmbDk0aWM5dHNhOHJoYW1oY3E1OHNkbGE3MGIuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDg5MDQ0ODQ2ODA5NDQxMzYyNDIiLCJlbWFpbCI6IndhZGVodWFuZzM2QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdF9oYXNoIjoiM3pIQ3RydWhLMTI5ZDJzaHNyMEFHUSIsImV4cCI6MTUxNzA4NzQ2NiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tIiwiaWF0IjoxNTE3MDgzODY2LCJuYW1lIjoiV2FkZSBIdWFuZyIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vLUhUUGJtSE43RVNBL0FBQUFBQUFBQUFJL0FBQUFBQUFBcWRZL0dvSVVCeFJ0V1MwL3M5Ni1jL3Bob3RvLmpwZyIsImdpdmVuX25hbWUiOiJXYWRlIiwiZmFtaWx5X25hbWUiOiJIdWFuZyIsImxvY2FsZSI6ImVuIn0.PD1ZIp8VxCfx7Cm4u7DT_TSlmG5nWH_tlDfBjDWdtg8UXXMedqQb9v0ouYFX6epySBJIVcc6CL10C16CX3_KWvLVEmv269O8v9fEqewuNyaMjz3nfhCl_GCCsFuPFDDYmA6ETZ_RI3zkBR9pJ5sOUdZaQGqmHSaeJIUAW4B-HUdJH--lxvWqaWIw3R_qJgJ41uJ9l-lz3YNXSYsURi6TEdbz0XBvMFnKpNvofDMQV9IVXUdxf8y_8nEWdX-vvlkUnRoJEHyOohbRdONExIZEKCxZsQjoPu5zIGOAIZYmN2sqQSM1hqzH8FjxnBFjRBZb5s7_lp1Z57OXaq8vLPjvnw",
            "expiry_date": 1517087460847
        };

        spyOn(axios, "default").and.returnValue(Promise.resolve({ data: fakeToken }));
        let result2 = await httpTester.get("/test/google/callback?code=test");

        let at: AccessToken = result2.body;
        expect(at.access_token).toEqual("wadehuang36@gmail.com-accessToken");
    });
});