import { Column, Entity, MongoRepository, ObjectIdColumn, createConnection } from "typeorm";

import { FultonApp } from "../fulton-app";
import { FultonAppOptions } from "../fulton-app-options";
import { inject } from "inversify";
import { repository } from "./repository-decorator";
import { MongoClient } from "mongodb";

@Entity("foods")
class Food {
    @ObjectIdColumn()
    id?: string;
    @Column()
    name?: String;
    @Column()
    category?: String;
}

@repository(Food)
class FoodRepository extends MongoRepository<Food> {
    constructor( @inject("injectValue1") public injectValue1: string) {
        super()
    }

    @inject("injectValue2")
    public injectValue2: number;
}

// the test needs database connections
class MyApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void | Promise<void> {
        options.databases.set("default", {
            type: "mongodb",
            url: "mongodb://localhost:27017/fulton-test",
            entities: [
                Food
            ]
        });

        options.repositories.push(FoodRepository);

        options.providers.push({ provide: "injectValue1", useValue: "test1" })
        options.providers.push({ provide: "injectValue2", useValue: 123 })
    }
}

fdescribe('repository', () => {
    it('should be created by app', async () => {
        let app = new MyApp();

        await app.init();

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
});