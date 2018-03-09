import { FultonApp } from "../../src/fulton-app";
import { FultonAppOptions } from "../../src/fulton-app-options";
import { Request, Response } from "../../src/interfaces";
import { HttpTester } from "../../src/test/http-tester";
import { setTimeout } from "timers";

class MyApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void | Promise<void> {
        options.settings.zoneEnabled = false;

        this.express.use("/test", (req, res) => {
            if ((<any>global)["Zone"]) {
                res.sendStatus(400);
            } else {
                res.sendStatus(200);
            }
        })
    }
}

xdescribe('No Zone', () => {
    let app: MyApp;
    let httpTester: HttpTester;

    beforeAll(async () => {
        app = new MyApp();
        httpTester = new HttpTester(app);
        return httpTester.start();
    });

    afterAll(async () => {
        return httpTester.stop();
    });

    it('should not load zone.js', async () => {
        let result = await httpTester.get("/test");
        
        expect(result.response.statusCode).toEqual(200);
    });
});