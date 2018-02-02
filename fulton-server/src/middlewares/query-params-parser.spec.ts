import { FultonApp, FultonAppOptions, Response, Request } from "../index";
import { queryParamsParser, queryById } from "./query-params-parser";
import { HttpTester } from "../../spec/helpers/http-tester";


class MyApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void | Promise<void> {
    }

    didInitRouters() {
        this.server.get("/", (req: Request, res: Response) => {
            res.send(req.queryParams);
        })

        this.server.get("/test/:id", queryById(), (req: Request, res: Response) => {
            res.send(req.queryParams);
        })
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
                b: "456",
                q: "789"
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
        let result = await httpTester.get("/?select=columeA,columeB ");

        expect(result.body).toEqual({
            select: ["columeA", "columeB"]
        });
    });

    it('should parse select with style 2', async () => {
        let result = await httpTester.get("/?select=columeA&select=columeB");

        expect(result.body).toEqual({
            select: ["columeA", "columeB"]
        });
    });

    it('should parse includes with style 1', async () => {
        let result = await httpTester.get("/?includes=columeA,columeB ");

        expect(result.body).toEqual({
            includes: ["columeA", "columeB"]
        });
    });

    it('should parse includes with style 2', async () => {
        let result = await httpTester.get("/?includes=columeA&includes=columeB");

        expect(result.body).toEqual({
            includes: ["columeA", "columeB"]
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
        let result = await httpTester.get("/?a=1&b=2&filter[name][$regex]=wade&filter[name][$options]=i&filter[$or][0][a]=1&filter[$or][1][b]=2&sort=a,-b,+c&select=columeA,columeB&includes=columeA&includes=columeB&pagination[index]=10&pagination[size]=100");

        expect(result.body).toEqual({
            filter: {
                name: {
                    "$regex": "wade",
                    "$options": "i"
                },
                "$or": [{ "a": "1" }, { "b": "2" }],
                a: "1",
                b: "2"
            },
            select: ["columeA", "columeB"],
            includes: ["columeA", "columeB"],
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
        let result = await httpTester.get("/test/wade?select=columeA,columeB&&includes=columeA&includes=columeB");

        expect(result.body).toEqual({
            filter: {
                id: "wade"
            },
            select: ["columeA", "columeB"],
            includes: ["columeA", "columeB"]
        });
    });
});