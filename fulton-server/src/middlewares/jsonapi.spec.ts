import { FultonApp, FultonAppOptions, Response, Request } from "../index";
import { queryParamsParser } from "./query-params-parser";
import { HttpTester } from "../../spec/helpers/http-tester";


class MyApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void | Promise<void> {
        this.options.formatter.jsonApi = true;
        this.options.index.handler = (req: Request, res: Response) => {
            res.send(req.body);
        }
    }
}

describe('query parser', () => {
    let app: MyApp;
    let httpTester: HttpTester;

    beforeAll(() => {
        app = new MyApp();
        httpTester = new HttpTester(app);

        httpTester.setHeaders({
            "content-type": "application/vnd.api+json"
        })

        return httpTester.start();
    });

    afterAll(async () => {
        return httpTester.stop();
    });

    it('should parse json-api', async () => {
        let result = await httpTester.postJson("/", jsonapiData);

        expect(result.body).toEqual(jsonData);

    });
});

let jsonData = {
    "data": [
        {
            "title": "JSON API paints my bikeshed!",
            "id": "1",
            "author": {
                "first-name": "Dan",
                "last-name": "Gebhardt",
                "twitter": "dgeb",
                "id": "9"
            }, "comments": [
                { "body": "First!", "id": "5" },
                { "body": "I like XML better", "id": "12" }
            ]
        }]
}

let jsonapiData = {
    "data": [{
        "type": "articles",
        "id": "1",
        "attributes": {
            "title": "JSON API paints my bikeshed!"
        },
        "links": {
            "self": "http://example.com/articles/1"
        },
        "relationships": {
            "author": {
                "links": {
                    "self": "http://example.com/articles/1/relationships/author",
                    "related": "http://example.com/articles/1/author"
                },
                "data": { "type": "people", "id": "9" }
            },
            "comments": {
                "links": {
                    "self": "http://example.com/articles/1/relationships/comments",
                    "related": "http://example.com/articles/1/comments"
                },
                "data": [
                    { "type": "comments", "id": "5" },
                    { "type": "comments", "id": "12" }
                ]
            }
        }
    }],
    "included": [{
        "type": "people",
        "id": "9",
        "attributes": {
            "first-name": "Dan",
            "last-name": "Gebhardt",
            "twitter": "dgeb"
        },
        "links": {
            "self": "http://example.com/people/9"
        }
    }, {
        "type": "comments",
        "id": "5",
        "attributes": {
            "body": "First!"
        },
        "relationships": {
            "author": {
                "data": { "type": "people", "id": "2" }
            }
        },
        "links": {
            "self": "http://example.com/comments/5"
        }
    }, {
        "type": "comments",
        "id": "12",
        "attributes": {
            "body": "I like XML better"
        },
        "relationships": {
            "author": {
                "data": { "type": "people", "id": "9" }
            }
        },
        "links": {
            "self": "http://example.com/comments/12"
        }
    }]
}