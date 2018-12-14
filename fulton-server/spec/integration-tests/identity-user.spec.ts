import { column, entity } from "../../src/entities";
import { FultonApp } from '../../src/fulton-app';
import { FultonUser } from "../../src/identity/fulton-impl/fulton-user";
import { FultonAppOptions } from '../../src/options/fulton-app-options';

@entity("my-users")
class MyUser extends FultonUser {
    @column()
    contacts: string[]
}

class MyApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void {
        options.identity.enabled = true;
        options.identity.userEntity = MyUser

        options.databases.set("default", {
            type: "mongodb",
            url: "mongodb://localhost:27017/fulton-test"
        });

    }
}

describe('Custom User', () => {
    let app: MyApp;

    beforeEach(() => {
        return app["dbConnections"][0].dropDatabase();
    })

    beforeAll(async () => {
        app = new MyApp();
        return app.init()
    });

    afterAll(() => {
        return app.stop();
    });

    it('should save extra fields', async () => {
        let user = await app.identityService.loginByOauth(null, { provider: "Test" }, { id: "testId", displayName: "test", contacts: ["a", "b", "c"], no: "abcd" })

        let actualUser = await app.identityService.getUser(user.id)

        expect(actualUser.displayName).toEqual("test");
        expect(actualUser.contacts).toEqual(["a", "b", "c"]);
        expect(actualUser.no).toBeUndefined();
    });
});