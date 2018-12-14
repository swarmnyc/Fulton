import { FultonApp } from '../../src/fulton-app';
import { FultonAppOptions } from '../../src/options/fulton-app-options';
import { Category } from "../entities/category";
import { Customer } from '../entities/customer';
import { Employee } from '../entities/employee';
import { Territory } from "../entities/territory";
import { MongoHelper } from "../helpers/mongo-helper";
import { sampleData } from "../support/sample-data";

class MyApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void {
        options.entities = [Employee, Territory, Category, Customer];

        options.databases.set("default", {
            type: "mongodb",
            url: "mongodb://localhost:27017/fulton-test"
        });
    }
}

describe('EntityService', () => {
    let app: MyApp;

    beforeAll(() => {
        app = new MyApp();

        return app.init()
    });

    beforeEach(() => MongoHelper.insertData(sampleData, true))

    afterAll(() => {
        return app.stop();
    });

    it('should create many employees', async () => {
        let es = app.getEntityService<Employee>(Employee);

        let result = await es.createMany([
            { lastName: "Test1", firstName: "Test2" },
            { lastName: "Test2", firstName: "Test2" },
        ])

        expect(result.length).toEqual(2);

        expect(result[0].employeeId).toBeDefined();
        expect(result[1].employeeId).toBeDefined();
    });

    it('should update many employees', async () => {
        let es = app.getEntityService<Employee>(Employee);

        let updateResult = await es.updateMany({ title: /Representative/i }, { title: "test" })

        let countResult = await es.count({ filter: { title: "test" } })

        expect(updateResult).toEqual(countResult);
    });

    it('should update many employees with unset', async () => {
        let es = app.getEntityService<Employee>(Employee);

        let updateResult = await es.updateMany({ title: /Representative/i }, { $unset: { title: 1 } })

        let countResult = await es.count({ filter: { title: { $exists: false } } })

        expect(updateResult).toEqual(countResult);
    });

    it('should delete many employees', async () => {
        let es = app.getEntityService<Employee>(Employee);

        let result = await es.deleteMany({ title: /Representative/i })

        expect(result).toBeGreaterThan(1);
    });

    it('should update fail by wrong id', () => {
        let es = app.getEntityService(Territory);

        return es.update("1", { territoryDescription: "abc" }).then(() => {
            fail("should fail")
        }).catch((e) => {
            expect(e.code).toBe("unmatched_id")
        })
    });

    it('should update and embedded objects', async () => {
        let es = app.getEntityService(Territory);

        await es.update(1581, { territoryDescription: "cba", $push: { "categories": { id: "1234" } } })

        let t = await es.findById(1581)

        expect(t.territoryDescription).toEqual("cba")
        expect(t.categories.length).toEqual(3)

        await es.update(1581, { $pull: { "categories": { id: "1234" } } })

        t = await es.findById(1581)
        expect(t.categories.length).toEqual(2)
    });
});