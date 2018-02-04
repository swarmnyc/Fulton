import { FultonApp, FultonAppOptions, OperationResult, Request, Response } from "../index";

import { Author } from "../../spec/helpers/entities/author";
import { Connection } from "typeorm/connection/Connection";
import { Hotdog } from "../../spec/helpers/entities/hot-dog";
import { HttpTester } from "../../spec/helpers/http-tester";
import { Tag } from "../../spec/helpers/entities/tag";
import { queryParamsParser } from "./query-params-parser";
import { sampleData } from "../../spec/support/sample-data";

class MyApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void | Promise<void> {
        this.options.formatter.jsonApi = true;
        this.options.index.handler = (req: Request, res: Response) => {
            res.send(req.body);
        }

        let conn = new Connection({
            type: "mongodb",
            entities: [Hotdog, Author, Tag]
        });

        conn["buildMetadatas"]();
        this.connections = [conn]
    }

    didInitRouters() {
        this.express.get("/hotdog", (req: Request, res: Response) => {

            let data = Object.assign(new Hotdog(), {
                "hotdogId": "1",
                "name": "name",
                "location": [1, 2],
                "address": "address",
                "review": "review",
                "author": { "id": "1" },
                "picture": "picture"
            });

            res.send({
                data: data
            });
        });

        this.express.get("/hotdogs", (req: Request, res: Response) => {
            let data: Hotdog[] = [];

            data.push(Object.assign(new Hotdog(), {
                "hotdogId": "1",
                "name": "name",
                "location": [1, 2],
                "address": "address",
                "review": "review",
                "author": { "id": "1" },
                "picture": "picture"
            }));

            data.push(Object.assign(new Hotdog(), {
                "hotdogId": "2",
                "name": "name",
                "address": "address",
                "review": "review",
                "author": {
                    "id": "2",
                    "name": "name",
                    "imageUrl": "imageUrl",
                    "tags": [
                        { "id": "10", "name": "name" },
                        { "id": "11", "name": "name" }]
                },
                "pictureUrl": "pictureUrl"
            }));

            res.send({
                data: data
            });
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
        app.connections = [];
        return httpTester.stop();
    });

    it('should deserializer', async () => {
        httpTester.setHeaders({
            "content-type": "application/vnd.api+json"
        })

        let result = await httpTester.post("/", {
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
        });

        expect(result.body).toEqual(
            {
                "data": [
                    {
                        "title": "JSON API paints my bikeshed!",
                        "id": "1",
                        "author": {
                            "first-name": "Dan",
                            "last-name": "Gebhardt",
                            "twitter": "dgeb",
                            "id": "9"
                        },
                        "comments": [
                            {
                                "body": "First!", "id": "5", "author": { "id": "2" }
                            },
                            {
                                "body": "I like XML better", "id": "12", "author": {
                                    "first-name": "Dan",
                                    "last-name": "Gebhardt",
                                    "twitter": "dgeb",
                                    "id": "9"
                                }
                            }
                        ]
                    }]
            });
    });

    it('should serializer hotdog', async () => {
        httpTester.setHeaders({
            "content-type": "application/vnd.api+json",
            "accept": "application/vnd.api+json"
        })

        let result = await httpTester.get("/hotdog");

        // console.log(result.body)
        expect(result.body).toEqual({
            "data": {
                "id": "1",
                "type": "Hotdog",
                "attributes": {
                    "name": "name",
                    "location": [1, 2],
                    "address": "address",
                    "review": "review"
                },
                "relationships": {
                    "author": {
                        "data": {
                            "id": "1",
                            "type": "Author"
                        }
                    }
                }
            }
        })
    });

    it('should serializer hotdogs', async () => {
        httpTester.setHeaders({
            "content-type": "application/vnd.api+json",
            "accept": "application/vnd.api+json"
        })

        let result = await httpTester.get("/hotdogs");

        // console.log(result.body)
        expect(result.body).toEqual({
            "data": [
                {
                    "id": "1",
                    "type": "Hotdog",
                    "attributes": {
                        "name": "name",
                        "location": [1, 2],
                        "address": "address",
                        "review": "review"
                    },
                    "relationships": {
                        "author": {
                            "data": {
                                "id": "1",
                                "type": "Author"
                            }
                        }
                    }
                },
                {
                    "id": "2",
                    "type": "Hotdog",
                    "attributes": {
                        "name": "name",
                        "address": "address",
                        "review": "review"
                    },
                    "relationships": {
                        "author": {
                            "data": {
                                "id": "2",
                                "type": "Author"
                            }
                        }
                    }
                }
            ],
            "included": [
                {
                    "id": "10",
                    "type": "Tag",
                    "attributes": {
                        "name": "name"
                    }
                },
                {
                    "id": "11",
                    "type": "Tag",
                    "attributes": {
                        "name": "name"
                    }
                },
                {
                    "id": "2",
                    "type": "Author",
                    "attributes": {
                        "name": "name"
                    },
                    "relationships": {
                        "tags": {
                            "data": [
                                {
                                    "id": "10",
                                    "type": "Tag"
                                },
                                {
                                    "id": "11",
                                    "type": "Tag"
                                }]
                        }
                    }
                }
            ]
        })
    });
});