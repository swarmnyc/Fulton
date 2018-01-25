import { FultonApp } from "../fulton-app";
import { FultonAppOptions } from "../fulton-app-options";
import { HttpTester } from "../../spec/helpers/http-tester";
import { AccessToken, authorize } from "../index";
import { UserServiceMock } from "../../spec/helpers/user-service-mock";


class MyApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void | Promise<void> {
        this.options.identify.enabled = true;
        this.options.identify.userService = new UserServiceMock(this);
    }

    initIdentify(): Promise<void> {
        super.initIdentify()

        this.server.all("/", (req, res) => {
            if (req.isAuthenticated()) {
                res.send("with user:" + req.user.username);
            } else {
                res.send("no user");
            }
        });

        this.server.get("/profile", authorize(), (req, res) => {
            res.send(req.user);
        });

        return null;
    }
}

// launch web server to test
describe('Identify local and bearer on UserServiceMock', () => {
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
        let result = await httpTester.postJson("/auth/login", {
            username: "test",
            password: "test"
        })

        let at: AccessToken = result.body;
        expect(at.access_token).toEqual("test-accessToken");
        expect(at.expires_in).toEqual(2592000);
    });

    it('should login fails', async () => {
        let result = await httpTester.postJson("/auth/login", {
            username: "test",
            password: "fail"
        })

        expect(result.response.statusCode).toEqual(401);
    });

    fit('should access with token', async () => {
        httpTester.setHeaders({
            "Authorization": "bearer test2-accessToken"
        })

        let result = await httpTester.get("/")

        expect(result.body).toEqual("with user:test2");
    });

    it('should access anonymously', async () => {
        let result = await httpTester.get("/")

        expect(result.body).toEqual("no user");
    });

    it('should register success by json', async () => {
        let result = await httpTester.postJson("/auth/register", {
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
        let result = await httpTester.postForm("/auth/register");

        expect(result.response.statusCode).toEqual(400);
    });
});