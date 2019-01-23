import { DiKeys, EventKeys } from '../../src/keys';
import { FultonApp } from '../../src/fulton-app';
import { FultonAppOptions } from '../../src/options/fulton-app-options';
import { IEmailService } from '../../src/types';

import { ClientSecurity } from '../../src/entities/client-security';
import { EntityService } from '../../src/entities/entity-service';
import { HttpTester } from '../../src/test/http-tester';
import { MongoHelper } from '../helpers/mongo-helper';

class MyApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void {
        options.security.enabled = true
        options.security.excludes = [
            /\/test1\/.*/
        ]

        options.index.message = "ok"

        options.databases.set("default", {
            type: "mongodb",
            url: "mongodb://localhost:27017/fulton-test"
        });

        this.events.once(EventKeys.AppDidInitSecurity, () => {
            this.express.get("/test1/:id", (req, res) => {
                res.send(req.params["id"])
            })

            this.express.get("/test2/:id", (req, res) => {
                res.send(req.params["id"])
            })
        })
    }
}

describe('Security', () => {
    let app: MyApp;
    let httpTester: HttpTester;
    let clientEntityService: EntityService<ClientSecurity>

    beforeAll(async () => {
        app = new MyApp();
        httpTester = new HttpTester(app);
        await httpTester.start();
        await MongoHelper.reset()

        clientEntityService = app.getEntityService(ClientSecurity) as EntityService<ClientSecurity>

        await clientEntityService.create({
            name: "test1",
            key: "abcd",
            expiredAt: new Date(9999, 11, 31, 23, 59, 59)
        })

        await clientEntityService.create({
            name: "test2",
            key: "bad",
            expiredAt: new Date(2000, 11, 31, 23, 59, 59)
        })
    })

    afterAll(() => {
        return httpTester.stop();
    });

    beforeEach(() => {
        httpTester.setHeaders({})
    })

    it('should be bad request, key is empty', async () => {
        let result = await httpTester.get("/")
        expect(result.response.statusCode).toEqual(400)
        expect(result.body.error.code).toEqual("bad-client-key")
    });

    it('should be bad request, key is wrong', async () => {
        let result = await httpTester.get("/?client-key=bcda")
        expect(result.response.statusCode).toEqual(400)
        expect(result.body.error.code).toEqual("bad-client-key")
    });

    it('should be bad request, key is wrong on header', async () => {
        httpTester.setHeaders({
            "x-client-key": "bcda"
        })

        let result = await httpTester.get("/")
        expect(result.response.statusCode).toEqual(400)
        expect(result.body.error.code).toEqual("bad-client-key")
    });

    it('should be pass request with url', async () => {
        let result = await httpTester.get("/?client-key=abcd")
        expect(result.response.statusCode).toEqual(200)
        expect(result.body).toEqual("ok")
    });

    it('should be pass request with header', async () => {
        httpTester.setHeaders({
            "x-client-key": "abcd"
        })

        let result = await httpTester.get("/")
        expect(result.response.statusCode).toEqual(200)
        expect(result.body).toEqual("ok")
    });

    it('should be pass request in exclude', async () => {
        let result = await httpTester.get("/test1/abc")
        expect(result.response.statusCode).toEqual(200)
        expect(result.body).toEqual("abc")
    });

    it('should be bad request not in exclude', async () => {
        let result = await httpTester.get("/test2/abc")
        expect(result.response.statusCode).toEqual(400)
        expect(result.body.error.code).toEqual("bad-client-key")
    });

    it('should be bad request with expired key', async () => {
        let result = await httpTester.get("/?client-key=bad")
        expect(result.response.statusCode).toEqual(400)
        expect(result.body.error.code).toEqual("bad-client-key")
    });
});