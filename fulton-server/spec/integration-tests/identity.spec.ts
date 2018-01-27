import { FultonApp, FultonAppOptions, authorize, AccessToken } from "../../src/index";
import { UserServiceMock } from "../helpers/user-service-mock";
import { HttpTester, HttpResult } from "../helpers/http-tester";


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
    }

    initIdentity(): void {
        super.initIdentity()
    }
}

xdescribe('Identity', () => {
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
        return httpTester.postJson("/auth/register", {
            email: "test@test.com",
            username: "test",
            password: "test123"
        })
    }

    it('should register', async () => {
        let result = await httpTester.postJson("/auth/register", {
            email: "test@test.com",
            username: "test",
            password: "test123"
        })

        expect(result.response.statusCode).toEqual(200);

        expect(result.body.errors).toBeUndefined();

        let at: AccessToken = result.body;
        expect(at.access_token).toBeTruthy();
        expect(at.token_type).toEqual("bearer");
        expect(at.expires_in).toEqual(2592000);
    });

    it('should register failure register wiht the same name and email', async () => {
        await prepareUser()

        let result = await httpTester.postJson("/auth/register", {
            email: "test@test.com",
            username: "test",
            password: "test123"
        });
        expect(result.response.statusCode).toEqual(400);

        expect(result.body.errors.username).toEqual(["the username is existed"]);
        expect(result.body.errors.email).toEqual(["the email is existed"]);
    });

    it('should login successfully', async () => {
        await prepareUser();

        let result = await httpTester.postJson("/auth/login", {
            username: "test",
            password: "test123"
        });

        expect(result.response.statusCode).toEqual(200);
        expect(result.body.access_token).toBeTruthy();
    });

    it('should login failure', async () => {
        await prepareUser();

        let result = await httpTester.postJson("/auth/login", {
            username: "test",
            password: "test321"
        });

        expect(result.response.statusCode).toEqual(400);
        expect(result.body.errors.$).toEqual(["username or password isn't correct"]);
    });

    it('should login with token', async () => {
        await prepareUser();

        let result = await httpTester.postJson("/auth/login", {
            username: "test",
            password: "test321"
        });

        expect(result.response.statusCode).toEqual(400);
        expect(result.body.errors.$).toEqual(["username or password isn't correct"]);
    });

    fit('should google oauth login', async () => {
        // should redirect        
        let result1 = await httpTester.get("/auth/google", null, false);
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
        let result2 = await httpTester.get("/auth/google/callback?code=test");

        let at: AccessToken = result2.body;
        expect(at.access_token).toBeTruthy();
        expect(at.token_type).toEqual("bearer");
        expect(at.expires_in).toEqual(2592000);
    });
});