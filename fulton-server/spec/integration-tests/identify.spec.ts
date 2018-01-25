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
    }
}

xdescribe('Identify', () => {
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

    it('should register', async () => {
        let result = await httpTester.postJson("/auth/register", {
            email: "test@test.com",
            username: "test",
            password: "test"
        })

        let at: AccessToken = result.body;
        expect(at.access_token).toEqual("test-accessToken");
        expect(at.token_type).toEqual("bearer");
        expect(at.expires_in).toEqual(2592000);
    });
});