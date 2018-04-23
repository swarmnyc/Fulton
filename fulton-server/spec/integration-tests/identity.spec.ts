import { HttpResult, HttpTester } from "../../src/test/http-tester";
import { Request, Response } from "../../src/interfaces";

import { AccessToken } from '../../src/identity/interfaces';
import { FultonApp } from '../../src/fulton-app';
import { FultonAppOptions } from '../../src/options/fulton-app-options';
import { FultonLog } from '../../src/fulton-log';

class MyApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void {
        options.identity.enabled = true;
        options.identity.google.enabled = true;
        options.identity.google.clientId = "test"
        options.identity.google.clientSecret = "test";

        options.databases.set("default", {
            type: "mongodb",
            url: "mongodb://localhost:27017/fulton-test"
        });

        options.index.handler = (req: Request, res: Response) => {
            if (req.isAuthenticated()) {
                res.send("user:" + req.user.username);
            } else {
                res.send("no user");
            }
        };
    }

    initIdentity(): void {
        super.initIdentity()
    }
}

describe('Identity Integration Test', () => {
    let app: MyApp;
    let httpTester: HttpTester;

    beforeEach(() => {
        httpTester.setHeaders(null);
        return app["connections"][0].dropDatabase();
    })

    beforeAll(async () => {
        app = new MyApp();
        httpTester = new HttpTester(app);
        return httpTester.start();
    });

    afterAll(async () => {
        return httpTester.stop();
    });

    function prepareUser(): Promise<HttpResult> {
        return httpTester.post("/auth/register", {
            email: "test@test.com",
            username: "test",
            password: "test123"
        })
    }

    it('should register', async () => {
        let result = await httpTester.post("/auth/register", {
            email: "test@test.com",
            username: "test",
            password: "test123"
        })

        expect(result.response.statusCode).toEqual(200);

        expect(result.body.error).toBeUndefined();

        let at: AccessToken = result.body;
        expect(at.access_token).toBeTruthy();
        expect(at.token_type).toEqual("bearer");
        expect(at.expires_in).toEqual(2592000);
    });

    it('should register failure register wiht the same name and email', async () => {
        await prepareUser()

        let result = await httpTester.post("/auth/register", {
            email: "Test@test.com",
            username: "Test",
            password: "test123"
        });
        expect(result.response.statusCode).toEqual(400);

        expect(result.body.error.detail.username).toEqual([ { code: 'existed', message: "the username is existed" }]);
        expect(result.body.error.detail.email).toEqual([ { code: 'existed', message: "the email is existed" }]);
    });

    it('should login successfully', async () => {
        await prepareUser();

        let result = await httpTester.post("/auth/login", {
            username: "Test",
            password: "test123"
        });

        expect(result.response.statusCode).toEqual(200);
        expect(result.body.access_token).toBeTruthy();
    });

    it('should login failure', async () => {
        await prepareUser();

        let result = await httpTester.post("/auth/login", {
            username: "test",
            password: "test321"
        });

        expect(result.response.statusCode).toEqual(400);
        expect(result.body.error.message).toEqual("username or password isn't correct");
    });

    it('should access with token', async () => {
        let result1 = await prepareUser();
        let token = result1.body as AccessToken;

        httpTester.setHeaders({
            "Authorization": `${token.token_type} ${token.access_token}`
        })

        let result = await httpTester.get("/")

        expect(result.body).toEqual("user:test");
    });

    it('should not access with wrong token', async () => {
        let result1 = await prepareUser();
        let token = result1.body as AccessToken;

        httpTester.setHeaders({
            "Authorization": `${token.token_type} ${token.access_token}123`
        })

        let result = await httpTester.get("/")

        expect(result.body).toEqual("no user");
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
        expect(at.access_token).toBeTruthy();
        expect(at.token_type).toEqual("bearer");
        expect(at.expires_in).toEqual(2592000);
    });
});