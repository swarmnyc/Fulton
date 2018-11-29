import { FultonApp } from "../../../src/fulton-app";
import { FultonAppOptions } from "../../../src/options/fulton-app-options";
import { Request, Response } from "../../../src/interfaces";
import { HttpTester } from "../../../src/test/http-tester";
import { setTimeout } from "timers";
import { Service } from '../../../src/services/service';
import { router, httpGet } from '../../../src/routers/route-decorators';
import { Router } from '../../../src/routers/router';

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
}

class MyApp extends FultonApp {
    constructor(private userZone:boolean){
        super()
    }

    protected onInit(options: FultonAppOptions): void | Promise<void> {
        options.services.push(TestService);
        options.routers.push(TestRouter);

        options.miscellaneous.zoneEnabled = this.userZone;

        this.express.use("/test", (req, res) => {
            if ((<any>global)["Zone"]) {
                res.sendStatus(400);
            } else {
                res.sendStatus(200);
            }
        })
    }
}

xdescribe('Zone', () => {
    it('should works', async () => {
        let app = new MyApp(true);
        let httpTester = new HttpTester(app);
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

    it('should not load zone.js', async () => {
        // this test have to run only itself, otherwise other tests will road zone.js before it.
        let app = new MyApp(false);
        let httpTester = new HttpTester(app);
        await httpTester.start();

        let result = await httpTester.get("/test");
        
        expect(result.response.statusCode).toEqual(200);

        await httpTester.stop();
    });
});