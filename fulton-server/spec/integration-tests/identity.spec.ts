import { FultonApp, FultonAppOptions, authorize, AccessToken } from "../../src/index";
import { UserServiceMock } from "../helpers/user-service-mock";
import { HttpTester, HttpResult } from "../helpers/http-tester";


class MyApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void {
        options.identity.enabled = true;
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
});