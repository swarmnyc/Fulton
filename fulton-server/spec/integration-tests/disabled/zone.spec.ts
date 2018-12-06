import { FultonApp } from "../../../src/fulton-app";
import { FultonAppOptions } from "../../../src/options/fulton-app-options";
import { Request, Response } from "../../../src/alias";
import { HttpTester } from "../../../src/test/http-tester";
import { setTimeout } from "timers";
import { Service } from '../../../src/services/service';
import { router, httpGet } from '../../../src/routers/route-decorators';
import { Router } from '../../../src/routers/router';
import { FultonError } from "../../../src/main";
import { sleep } from "../../helpers/test-helper";

class TestService extends Service {
    getId() {
        return this.app.getLocalData("id")
    }

    setId(value: any) {
        this.app.setLocalData("id", value);
    }
}

@router("/test")
class TestRouter extends Router {
    constructor(private service: TestService) {
        super();
    }

    @httpGet()
    async get(req: Request, res: Response) {
        this.service.setId(req.query.id)

        await this.delay(req.query.id).then(() => {
            console.log(`id:${req.query.id}, then, zone:${Zone.current.name}`);
        });

        console.log(`id:${req.query.id}, after await, zone:${Zone.current.name}`);

        res.send(this.service.getId());

    }

    delay(id: string): Promise<void> {
        console.log(`id:${id}, delaying, zone:${Zone.current.name}`);

        return new Promise((resolve, reject) => {
            console.log(`id:${id}, delayed, zone:${Zone.current.name}`);

            setTimeout(() => {
                console.log(`id:${id}, resolved, zone:${Zone.current.name}`);
                resolve();
            }, Math.random() * 1000);
        });

    }

    @httpGet("/sync-error")
    syncError(req: Request, res: Response) {
        throw new FultonError("sync-error")
    }

    @httpGet("/promise-error")
    promiseError(req: Request, res: Response) {
        new Promise(() => {
            throw new FultonError("promise-error")
        })
    }

    @httpGet("/async-error")
    async asyncError(req: Request, res: Response) {
        await sleep(1)

        throw new FultonError("async-error")
    }

    @httpGet("/zone")
    async zone(req: Request, res: Response) {
        if ((<any>global)["Zone"]) {
            res.sendStatus(400);
        } else {
            res.sendStatus(200);
        }
    }
}

class MyApp extends FultonApp {
    constructor() {
        super()
    }

    protected onInit(options: FultonAppOptions): void | Promise<void> {
        options.services.push(TestService);
        options.routers.push(TestRouter);
    }
}

xdescribe('Zone', () => {
    it('should works', async () => {
        let app = new MyApp();
        let httpTester = new HttpTester(app, true);
        await httpTester.start();
        let task1 = httpTester.get("/test?id=1");
        let task2 = httpTester.get("/test?id=2");
        let task3 = httpTester.get("/test?id=3");

        let result1 = await task1;
        let result2 = await task2;
        let result3 = await task3;

        expect(result1.body).toEqual("1")
        expect(result2.body).toEqual("2")
        expect(result3.body).toEqual("3")

        await httpTester.stop();
    });

    it('should catch errors', async () => {
        let app = new MyApp();
        let httpTester = new HttpTester(app, true);
        await httpTester.start();
        let syncError = await httpTester.get("/test/sync-error");
        let promiseError = await httpTester.get("/test/promise-error");
        let asyncError = await httpTester.get("/test/async-error");


        expect(syncError.body.error.code).toEqual("sync-error")
        expect(promiseError.body.error.code).toEqual("promise-error")
        expect(asyncError.body.error.code).toEqual("async-error")

        await httpTester.stop();
    });
});

xdescribe('No Zone', () => {
    it('should catch errors', async () => {
        // TODO: because Promise and async error is caught by zone.
        // Have to fine a way to handle it
        let app = new MyApp();
        let httpTester = new HttpTester(app, false);
        await httpTester.start();
        let syncError = await httpTester.get("/test/sync-error");
        let promiseError = await httpTester.get("/test/promise-error");
        let asyncError = await httpTester.get("/test/async-error");

        expect(syncError.body.error.code).toEqual("sync-error")
        expect(promiseError.body.error.code).toEqual("promise-error")
        expect(asyncError.body.error.code).toEqual("async-error")

        await httpTester.stop();
    });

    it('should not load zone.js', async () => {
        // this test have to run only itself, otherwise other tests will road zone.js before it.
        let app = new MyApp();
        let httpTester = new HttpTester(app, false);
        await httpTester.start();

        let result = await httpTester.get("/test/zone");

        expect(result.response.statusCode).toEqual(200);

        await httpTester.stop();
    });
});