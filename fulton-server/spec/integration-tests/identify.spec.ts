import { FultonApp, FultonAppOptions, authorize, AccessToken } from "../../src/index";
import { UserServiceMock } from "../helpers/user-service-mock";
import { HttpTester } from "../helpers/http-tester";


class MyApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void {
        options.identify.enabled = true;
        options.databases.set("default", {
            type: "mongodb",
            url: "mongodb://localhost:27017/fulton-test"
        });
    }

    initIdentify(): void {
        super.initIdentify()

        this.server.all("/register", (req, res) => {
            req.userService.register({
                username: "test",
                password: "test"
            });
        });
    }
}

// launch web server to test
xdescribe('Identify local and bearer on  UserServiceMock', () => {
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

    it('should access with token', async () => {
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
});