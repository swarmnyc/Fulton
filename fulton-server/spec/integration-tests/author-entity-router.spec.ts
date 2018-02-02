import { FultonApp, FultonAppOptions, authorize, AccessToken, Request, Response, FultonEntityRouter, entityRouter, OperationResult, QueryParams, OperationOneResult, OperationStatus, router, MongoEntityService, injectable, httpGet } from "../../src/index";
import { UserServiceMock } from "../helpers/user-service-mock";
import { HttpTester, HttpResult } from "../helpers/http-tester";
import { Hotdog } from "../helpers/entities/hot-dog";
import { MongoHelper } from "../helpers/mongo-helper";
import { sampleData } from "../support/sample-data";
import { Author } from "../helpers/entities/author";
import { Tag } from "../helpers/entities/tag";
import { MongoRepository } from "typeorm/repository/MongoRepository";


@injectable()
class AuthorEntityService extends MongoEntityService<Author>{
    private tagRepository: MongoRepository<Tag>;
    constructor() {
        super(Author);

        this.tagRepository = this.getRepository(Tag);
    }

    getTags(queryParams: QueryParams): Promise<OperationResult<Tag>> {
        return this.findInternal(this.tagRepository, queryParams)
            .then((result) => {
                return {
                    data: result[0],
                    pagination: {
                        total: result[1]
                    }
                }
            })
            .catch(this.errorHandler);
    }

    async getTagsByAuthorId(authorId: string): Promise<Tag[]> {
        let author = await this.mainRepository.findOne({ "_id": authorId } as any);
        let tagIds = author.tagIds;

        return this.tagRepository.find({ "_id": { "$in": tagIds } } as any);
    }
}

@router(/\/authors?/)
class AuthorEntityRouter extends FultonEntityRouter<Author>{
    constructor(protected entityService: AuthorEntityService) {
        super(entityService)
    }

    @httpGet("/tags")
    tags(req: Request, res: Response) {
        this.entityService
            .getTags(req.queryParams)
            .then(this.sendResult(res));
    }

    @httpGet("/:id/tags")
    authorTags(req: Request, res: Response) {
        this.entityService
            .getTagsByAuthorId(req.params.id)
            .then((tags) => {
                res.send({
                    data: tags
                });
            })
            .catch((err) => {
                res.status(400).send({
                    errors: {
                        message: err.message
                    }
                });
            });
    }
}


class MyApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void {
        options.entities = [Hotdog, Author, Tag];
        options.routers = [AuthorEntityRouter];
        options.services = [AuthorEntityService];

        options.databases.set("default", {
            type: "mongodb",
            url: "mongodb://localhost:27017/fulton-test"
        });
    }
}

describe('MongoEntityRouter Integration Test', () => {
    let app: MyApp;
    let httpTester: HttpTester;

    beforeAll(async () => {
        app = new MyApp();
        httpTester = new HttpTester(app);
        await httpTester.start();
        await MongoHelper.insertData(sampleData, true);
    });

    afterAll(async () => {
        return httpTester.stop();
    });

    it('should return all authors by author', async () => {
        let result = await httpTester.get("/author")

        expect(result.response.statusCode).toEqual(200);

        let queryResult: OperationResult = result.body;
        expect(queryResult.data.length).toEqual(17);
    });

    it('should return all authors by authors', async () => {
        let result = await httpTester.get("/authors")

        expect(result.response.statusCode).toEqual(200);

        let queryResult: OperationResult = result.body;
        expect(queryResult.data.length).toEqual(17);
    });

    it('should return the tags by author id', async () => {
        let result = await httpTester.get("/author/965/tags")

        expect(result.response.statusCode).toEqual(200);

        let queryResult: OperationResult = result.body;
        expect(queryResult.data.length).toEqual(2);
        expect(queryResult.data).toEqual([
            {
                "id": "57dafbafe73bbf531a10598c",
                "name": "Essentials",
                "type": "Category"
            },
            {
                "id": "57dafd1277c8e338b97b5dcb",
                "name": "Eat",
                "type": "Category"
            }
        ]);
    });

    it('should return tags', async () => {
        let result = await httpTester.get("/authors/tags", {
            pagination: {
                size: 30
            }
        });

        expect(result.response.statusCode).toEqual(200);

        let queryResult: OperationResult = result.body;
        expect(queryResult.data.length).toEqual(22);
    });

    it('should return 5 authors', async () => {
        let params: QueryParams = {
            pagination: {
                size: 5
            }
        }

        let result = await httpTester.get("/author", params)

        expect(result.response.statusCode).toEqual(200);

        let queryResult: OperationResult = result.body;
        expect(queryResult.data.length).toEqual(5);
        expect(queryResult.pagination.total).toEqual(17);
    });

    it('should return the last 2 author', async () => {
        let params: QueryParams = {
            pagination: {
                index: 3, // page 4
                size: 5
            }
        }

        let result = await httpTester.get("/authors", params)

        expect(result.response.statusCode).toEqual(200);

        let queryResult: OperationResult = result.body;
        expect(queryResult.data.length).toEqual(2);
        expect(queryResult.pagination.total).toEqual(17);
    });

    it('should return authors with filter', async () => {
        let params: QueryParams = {
            filter: {
                name: {
                    "$like": "g"
                }
            }
        }

        let result = await httpTester.get("/author", params)

        expect(result.response.statusCode).toEqual(200);

        let queryResult: OperationResult<Hotdog> = result.body;
        expect(queryResult.data.length).toEqual(4);
    });

    it('should return one hotdog with :id', async () => {
        let result = await httpTester.get("/author/384")

        expect(result.response.statusCode).toEqual(200);

        let queryResult: OperationOneResult<Author> = result.body;
        expect(queryResult.data.name).toEqual("Laney Gray");
    });

    it('should insert a hotdog', async () => {
        let data = {
            "name": "Test1",
            "imageUrl": "Test2"
        } as Author;

        let result = await httpTester.post("/author", {
            data: data
        });

        expect(result.response.statusCode).toEqual(200);

        let queryResult: OperationOneResult<Author> = result.body;
        expect(queryResult.data.id).toBeTruthy();

        delete queryResult.data.id;

        expect(queryResult.data).toEqual(data);
    });

    it('should update a hotdog', async () => {
        let data = {
            "name": "Test1",
            "imageUrl": "Test2"
        } as Author;

        let result = await httpTester.patch("/author/675", {
            data: data
        })

        expect(result.response.statusCode).toEqual(202);
    });

    it('should delete a author', async () => {
        let result = await httpTester.delete("/authors/384")

        expect(result.response.statusCode).toEqual(202);
    });


    it('should load a author with tags', async () => {
        let result = await httpTester.get("/authors/965", {
            includes: ["tags"]
        })

        expect(result.response.statusCode).toEqual(200);

        let queryResult: OperationOneResult<Author> = result.body;
        expect(queryResult.data.tags.length).toEqual(2);
    });
});