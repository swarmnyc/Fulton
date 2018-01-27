import { FultonApp } from "../fulton-app";
import { FultonAppOptions } from "../fulton-app-options";
import { IStrategyOptionsWithRequest, Strategy as LocalStrategy, Strategy } from 'passport-local';
import { HttpTester } from "../../spec/helpers/http-tester";
import { AccessToken, authorize, authorizeByRole, authorizeByRoles, Router, HttpGet, Request, Response, FultonRouter, FultonImpl } from "../index";
import { UserServiceMock } from "../../spec/helpers/user-service-mock";

class MyApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void | Promise<void> {
        this.options.identity.enabled = true;
        this.options.identity.userService = new UserServiceMock(this);
        this.options.identity.login.enabled = false;
        this.options.identity.register.enabled = false;
        this.options.identity.bearer.enabled = false;

        this.options.identity.addStrategy(
            {
                name: "login",
                path: "/test/login",
                httpMethod: "post",
                verifier: FultonImpl.localStrategyVerifier,
                successMiddleware: FultonImpl.successMiddleware
            }, LocalStrategy)
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
});