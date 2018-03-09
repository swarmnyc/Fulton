import { Request, Response } from "../interfaces";
import { queryById, queryParamsParser } from "./query-params-parser";

import { FultonApp } from '../fulton-app';
import { FultonAppOptions } from '../fulton-app-options';
import { HttpTester } from "../../spec/helpers/http-tester";

class MyApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void | Promise<void> {
        this.options.index.enabled = false;
        this.events.once("didInitRouters", () => {
            this.express.get("/", (req: Request, res: Response) => {            
                res.send(req.queryParams);
            })

            this.express.get("/test/:id", queryById(), (req: Request, res: Response) => {
                res.send(req.queryParams);
            })
        });
    }
}

describe('query parser', () => {
    let app: MyApp;
    let httpTester: HttpTester;

    beforeAll(() => {
        app = new MyApp();
        httpTester = new HttpTester(app);
        return httpTester.start();
    });

    afterAll(async () => {
        return httpTester.stop();
    });

    it('should parse basic filter', async () => {
        let result = await httpTester.get("/?filter[a]=123&filter[b]=456&q=789");

        expect(result.body).toEqual({
            filter: {
                a: "123",
                b: "456"
            }
        });
    });

    it('should parse advanced filter', async () => {
        let result = await httpTester.get("/?filter[name][$regex]=wade&filter[name][$options]=i&filter[$or][0][a]=1&filter[$or][1][b]=2");

        expect(result.body).toEqual({
            filter: {
                name: {
                    "$regex": "wade",
                    "$options": "i"
                },

                "$or": [{ "a": "1" }, { "b": "2" }]
            }
        });
    });

    it('should parse sort with style 1', async () => {
        let result = await httpTester.get("/?sort[a]=1&sort[b]=-1");

        expect(result.body).toEqual({
            sort: {
                a: 1,
                b: -1
            }
        });
    });

    it('should parse sort with style 2', async () => {
        let result = await httpTester.get("/?sort=a,-b, +c");

        expect(result.body).toEqual({
            sort: {
                a: 1,
                b: -1,
                c: 1
            }
        });
    });

    it('should parse select with style 1', async () => {
        let result = await httpTester.get("/?select=columnA,columnB ");

        expect(result.body).toEqual({
            select: ["columnA", "columnB"]
        });
    });

    it('should parse select with style 2', async () => {
        let result = await httpTester.get("/?select=columnA&select=columnB");

        expect(result.body).toEqual({
            select: ["columnA", "columnB"]
        });
    });

    it('should parse includes with style 1', async () => {
        let result = await httpTester.get("/?includes=columnA,columnB ");

        expect(result.body).toEqual({
            includes: ["columnA", "columnB"]
        });
    });

    it('should parse includes with style 2', async () => {
        let result = await httpTester.get("/?includes=columnA&includes=columnB");

        expect(result.body).toEqual({
            includes: ["columnA", "columnB"]
        });
    });

    it('should parse pagination', async () => {
        let result = await httpTester.get("/?pagination[index]=10&pagination[size]=100");

        expect(result.body).toEqual({
            pagination: {
                index: 10,
                size: 100
            }
        });
    });

    it('should parse mixed', async () => {
        let result = await httpTester.get("/?a=1&b=2&filter[name][$regex]=wade&filter[name][$options]=i&filter[$or][0][a]=1&filter[$or][1][b]=2&sort=a,-b,+c&select=columnA,columnB&includes=columnA&includes=columnB&pagination[index]=10&pagination[size]=100");

        expect(result.body).toEqual({
            filter: {
                name: {
                    "$regex": "wade",
                    "$options": "i"
                },
                "$or": [{ "a": "1" }, { "b": "2" }]
            },
            select: ["columnA", "columnB"],
            includes: ["columnA", "columnB"],
            sort: {
                a: 1,
                b: -1,
                c: 1
            },
            pagination: {
                index: 10,
                size: 100
            }
        });
    });

    it('should parse with id', async () => {
        let result = await httpTester.get("/test/wade?select=columnA,columnB&&includes=columnA&includes=columnB");

        expect(result.body).toEqual({
            filter: {
                id: "wade"
            },
            select: ["columnA", "columnB"],
            includes: ["columnA", "columnB"]
        });
    });
});