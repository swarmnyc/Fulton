import * as passport from 'passport';

import { Request, Response } from "../interfaces";
import { Router, httpGet, router } from '../routers';
import { authorized, authorizedByRole, authorizedByRoles } from './authorizes-middlewares';

import { AccessToken } from './interfaces';
import { FultonApp } from "../fulton-app";
import { FultonAppOptions } from "../fulton-app-options";
import { HttpTester } from "../test/http-tester";
import { UserServiceMock } from "../../spec/helpers/user-service-mock";

@router("/test")
export class TestRouter extends Router {
    @httpGet("/role", authorizedByRole("admin"))
    role(req: Request, res: Response) {
        res.send("works");
    }

    @httpGet("/roles", authorizedByRoles(["admin", "rd"]))
    roles(req: Request, res: Response) {
        res.send("works");
    }
}

@router("/test2", authorizedByRole("admin"))
export class TestRouter2 extends Router {
    @httpGet()
    index(req: Request, res: Response) {
        res.send("works");
    }
}

class MyApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void | Promise<void> {
        this.options.identity.enabled = true;
        this.options.identity.userService = new UserServiceMock(this);

        this.options.identity.google.enabled = true;
        this.options.identity.google.clientId = "test";
        this.options.identity.google.clientSecret = "test";

        this.options.identity.github.enabled = true;
        this.options.identity.github.clientId = "test";
        this.options.identity.github.clientSecret = "test";

        this.options.routers = [TestRouter, TestRouter2];
    }

    initIdentity(): Promise<void> {
        super.initIdentity()

        this.express.all("/", (req, res) => {
            if (req.isAuthenticated()) {
                res.send("with user:" + req.user.username);
            } else {
                res.send("no user");
            }
        });

        this.express.get("/profile", authorized(), (req, res) => {
            res.send(req.user);
        });

        return null;
    }
}

// launch web server to test
describe('Identity local and bearer on UserServiceMock', () => {
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

    it('should login and return access token', async () => {
        let result = await httpTester.post("/auth/login", {
            username: "test",
            password: "test"
        })

        let at: AccessToken = result.body;
        expect(at.access_token).toEqual("test-accessToken");
        expect(at.expires_in).toEqual(2592000);
    });

    it('should login fails', async () => {
        let result = await httpTester.post("/auth/login", {
            username: "test",
            password: "fail"
        })

        expect(result.response.statusCode).toEqual(400);
    });

    it('should access with token', async () => {
        httpTester.setHeaders({
            "Authorization": "bearer test2-accessToken"
        })

        let result = await httpTester.get("/")

        expect(result.body).toEqual("with user:test2");
    });


    it('should access profile success', async () => {
        httpTester.setHeaders({
            "Authorization": "bearer test2-accessToken"
        })

        let result = await httpTester.get("/profile")

        expect(result.body.username).toEqual("test2");
    });

    it('should access profile failure', async () => {
        httpTester.setHeaders({
            "Authorization": "bearer failure"
        })

        let result = await httpTester.get("/profile")

        expect(result.response.statusCode).toEqual(401);
    });

    it('should access profile failure 2', async () => {
        httpTester.setHeaders({
            "Authorization": "bearer "
        })

        let result = await httpTester.get("/profile")

        expect(result.response.statusCode).toEqual(401);
    });

    it('should access anonymously', async () => {
        let result = await httpTester.get("/")

        expect(result.body).toEqual("no user");
    });

    it('should register success by json', async () => {
        let result = await httpTester.post("/auth/register", {
            email: "test@test.com",
            username: "test3",
            password: "test3"
        });

        let at: AccessToken = result.body;
        expect(at.access_token).toEqual("test3-accessToken");
        expect(at.token_type).toEqual("bearer");
    });

    it('should register success by from', async () => {
        let result = await httpTester.postForm("/auth/register", {
            email: "test@test.com",
            username: "test4",
            password: "test4"
        });

        let at: AccessToken = result.body;
        expect(at.access_token).toEqual("test4-accessToken");
        expect(at.token_type).toEqual("bearer");
    });

    it('should register failure by empty data', async () => {
        let result = await httpTester.post("/auth/register");

        let error = result.body.error;
    
        expect(result.response.statusCode).toEqual(400);
        expect(error.detail.username).toEqual("username is required");
        expect(error.detail.password).toEqual("password is required");
        expect(error.detail.email).toEqual("email is required");
    });

    it('should authorize by role success', async () => {
        httpTester.setHeaders({
            "Authorization": "bearer admin-accessToken"
        })

        let result = await httpTester.get("/test/role")

        expect(result.body).toEqual("works");
    });

    it('should authorize by role failure', async () => {
        httpTester.setHeaders({
            "Authorization": "bearer user-accessToken"
        })

        let result = await httpTester.get("/test/role")

        expect(result.response.statusCode).toEqual(403);
    });

    it('should authorize by role success', async () => {
        httpTester.setHeaders({
            "Authorization": "bearer rd-accessToken"
        })

        let result = await httpTester.get("/test/roles")

        expect(result.body).toEqual("works");
    });

    it('should authorize by role failure', async () => {
        httpTester.setHeaders({
            "Authorization": "bearer user-accessToken"
        })

        let result = await httpTester.get("/test/roles")

        expect(result.response.statusCode).toEqual(403);
    });

    it('should authorize by role on router level success', async () => {
        httpTester.setHeaders({
            "Authorization": "bearer admin-accessToken"
        })

        let result = await httpTester.get("/test2")

        expect(result.body).toEqual("works");
    });

    it('should authorize by role on router level failure', async () => {
        httpTester.setHeaders({
            "Authorization": "bearer user-accessToken"
        })

        let result = await httpTester.get("/test2")

        expect(result.response.statusCode).toEqual(403);
    });

    it('should google oauth login', async () => {
        // should redirect        
        let result1 = await httpTester.get("/auth/google", null, false);
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
        let result2 = await httpTester.get("/auth/google/callback?code=test");

        let at: AccessToken = result2.body;
        expect(at.access_token).toEqual("test@gmail.com-accessToken");
    });

    it('should github oauth login', async () => {
        // should redirect        
        let result1 = await httpTester.get("/auth/github", null, false);
        expect(result1.response.headers.location).toContain("https://github.com/login/oauth/authorize");

        //should parse the code
        let oauth2 = require("oauth").OAuth2;

        spyOn(oauth2.prototype, "_request").and.callFake((method: any, url: string, headers: any, post_body: any, access_token: any, callback: any) => {
            if (url.startsWith("https://github.com/login/oauth/access_token")) {
                callback(null, "access_token=0a19c6216599daf812a601d78164b17e60b61be4&scope=read%3Auser%2Cuser%3Aemail&token_type=bearer")
            } else if (url.startsWith("https://api.github.com/user/emails")){
                callback(null, `[]`)
            } else {
                callback(null, `{"login":"test","name":"test","email":"test@test.com"}`)
            }
        });

        let result2 = await httpTester.get("/auth/github/callback?code=test");

        let at: AccessToken = result2.body;
        expect(at.access_token).toEqual("test@test.com-accessToken");
    });
});