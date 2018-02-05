import { FultonApp, FultonAppOptions, OperationResult, Request, Response, EntityRouter, entityRouter, httpGet, IEntityService } from "../index";

import { Author } from "../../spec/helpers/entities/author";
import { Connection } from "typeorm/connection/Connection";
import { Hotdog } from "../../spec/helpers/entities/hot-dog";
import { HttpTester } from "../../spec/helpers/http-tester";
import { Tag } from "../../spec/helpers/entities/tag";
import { queryParamsParser } from "./query-params-parser";
import { sampleData } from "../../spec/support/sample-data";
import { QueryParams, OperationOneResult, OperationStatus } from "../interfaces";

class HotdogEntityService implements IEntityService<Hotdog> {
    find(queryParams: QueryParams): Promise<OperationResult<Hotdog>> {
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

        return Promise.resolve({
            data: data,
            pagination: {
                index: 1,
                size: 2,
                total: 10
            }
        });
    }

    findOne(queryParams: QueryParams): Promise<OperationOneResult<Hotdog>> {
        let data: Hotdog = Object.assign(new Hotdog(), {
            "hotdogId": "1",
            "name": "name",
            "location": [1, 2],
            "address": "address",
            "review": "review",
            "author": { "id": "1" },
            "picture": "picture"
        });

        return Promise.resolve({
            data: data
        });
    }
    create(entity: Hotdog): Promise<OperationOneResult<Hotdog>> {
        throw new Error("Method not implemented.");
    }
    update(id: string, entity: Hotdog): Promise<OperationStatus> {
        throw new Error("Method not implemented.");
    }
    delete(id: string): Promise<OperationStatus> {
        throw new Error("Method not implemented.");
    }
}

@entityRouter("/hotdogs", Hotdog)
class HotdogRouter extends EntityRouter<Hotdog> {
    constructor() {
        super(new HotdogEntityService());
    }
}

class MyApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void | Promise<void> {
        this.options.formatter.jsonApi = true;
        this.options.index.handler = (req: Request, res: Response) => {
            res.send(req.body);
        }

        this.options.routers = [HotdogRouter];

        let conn = new Connection({
            type: "mongodb",
            entities: [Hotdog, Author, Tag]
        });

        conn["buildMetadatas"]();
        this.connections = [conn]
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

        let result = await httpTester.get("/hotdogs/1");

        // console.log(result.body)
        expect(result.body).toEqual({
            "data": {
                "id": "1",
                "type": "Hotdog",
                "links": {
                    "self": 'http://localhost:3000/hotdogs/1'
                },
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

        let result = await httpTester.get("/hotdogs?test=test");

        // console.log(result.body)
        expect(result.body).toEqual({
            "data": [
                {
                    "id": "1",
                    "type": "Hotdog",
                    "links": {
                        "self": "http://localhost:3000/hotdogs/1"
                    },
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
                    "links": {
                        "self": "http://localhost:3000/hotdogs/2"
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
            "links": {
                "first": 'http://localhost:3000/hotdogs?filter%5Btest%5D=test&pagination%5Bindex%5D=0&pagination%5Bsize%5D=2',
                "last": 'http://localhost:3000/hotdogs?filter%5Btest%5D=test&pagination%5Bindex%5D=4&pagination%5Bsize%5D=2',
                "prev": 'http://localhost:3000/hotdogs?filter%5Btest%5D=test&pagination%5Bindex%5D=0&pagination%5Bsize%5D=2',
                "next": 'http://localhost:3000/hotdogs?filter%5Btest%5D=test&pagination%5Bindex%5D=2&pagination%5Bsize%5D=2',
                "meta": { "index": 1, "size": 2, "total": 10 }
            },
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