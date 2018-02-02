import { Column, Entity, MongoRepository, ObjectIdColumn, createConnection } from "typeorm";

import { Repo, Inject, FultonApp, FultonAppOptions } from "../../src/index";

@Entity("foods")
class Food {
    @ObjectIdColumn()
    id?: string;
    @Column()
    name?: String;
    @Column()
    category?: String;
}

@Repo(Food)
class FoodRepository extends MongoRepository<Food> {
    constructor( @Inject("injectValue1") public injectValue1: string) {
        super()
    }

    @Inject("injectValue2")
    public injectValue2: number;
}

@Repo(Food, "conn2")
class FoodRepository2 extends MongoRepository<Food> {
}

// the test needs database connections
class MyApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void | Promise<void> {
        options.databases.set("default", {
            type: "mongodb",
            url: "mongodb://localhost:27017/fulton-test"
        });

        options.databases.set("conn2", {
            type: "mongodb",
            url: "mongodb://localhost:27017/fulton-test2",
            entities: [Food]
        });

        options.entities = [Food];

        options.repositories = [FoodRepository, FoodRepository2];

        options.providers.push({ provide: "injectValue1", useValue: "test1" })
        options.providers.push({ provide: "injectValue2", useValue: 123 })
    }
}

describe('repository', () => {
    let app: MyApp;

    beforeAll(async () => {
        app = new MyApp();
        await app.init();
    });

    afterAll(() => {
        return app.stop()
    });

    it('should be created by app', async () => {
        let foodRepo = app.container.get(FoodRepository);

        expect(foodRepo).toBeTruthy();
        expect(foodRepo.injectValue1).toEqual("test1");
        expect(foodRepo.injectValue2).toEqual(123);

        foodRepo.injectValue2 = 321;

        foodRepo = app.container.get(FoodRepository); // should be the same

        expect(foodRepo.injectValue2).toEqual(321);

        let food: Food = {
            name: "name",
            category: "category"
        }

        await foodRepo.save(food);

        expect(food.id).toBeTruthy();
    });

    it('should be created multiple connections', async () => {
        let foodRepo1 = app.container.get(FoodRepository); // should be the same
        let food: Food = {
            name: "name",
            category: "category"
        }

        await foodRepo1.save(food);

        expect(food.id).toBeTruthy();

        let foodRepo2 = app.container.get(FoodRepository2);

        food = {
            name: "name",
            category: "category"
        }

        await foodRepo2.save(food);

        expect(food.id).toBeTruthy();
    });
});