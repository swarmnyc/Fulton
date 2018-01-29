import { Entity, ObjectIdColumn, Column } from "typeorm";
import { Router, HttpGet, EntityRouter } from "./route-decorators";
import { FultonEntityRouter } from "./fulton-entity-router";
import { FultonEntityService } from "../services/fulton-entity-service";
import { Injectable } from "../index";
import { FultonApp } from "../fulton-app";
import { FultonAppOptions } from "../fulton-app-options";
import * as typeorm from 'typeorm';
import { Repository } from "typeorm/repository/Repository";

@Entity("foods")
class Food {
    @ObjectIdColumn()
    id?: string;
    @Column()
    name?: String;
    @Column()
    category?: String;
}

class FoodRepository extends Repository<Food>{
}

@Injectable()
class FoodEntityService extends FultonEntityService<Food> {
    constructor() {
        super(new FoodRepository());
    }
}

@EntityRouter("/A", Food)
class EntityRouterA extends FultonEntityRouter<Food> {

}

@Router("/B")
class EntityRouterB extends FultonEntityRouter<Food> {
    constructor(protected entityService: FoodEntityService) {
        super(entityService);
    }
}

class MyApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void | Promise<void> {
        options.entities = [Food];
        options.routers = [EntityRouterA, EntityRouterB];
        options.services = [FoodEntityService];
    }
}

describe('Fulton Entity Router', () => {
    let spy: jasmine.Spy;
    beforeAll(() => {
        spy = spyOn(typeorm, "getRepository").and.returnValue(new FoodRepository());
    });

    afterAll(()=>{
        spy.and.callThrough();
    })

    it('should create instances for EntityRouterA for style 1', async () => {

        let app = new MyApp();
        await app.init();

        let router: FultonEntityRouter<any> = app.container.get(EntityRouterA);

        expect(router).toBeTruthy();
        expect(router["entityService"]).toBeTruthy();
    });

    it('should create instances for EntityRouterB for style 2', async () => {
        let app = new MyApp();
        await app.init();

        let router = app.container.get(EntityRouterB);
        expect(router).toBeTruthy();
        expect(router["entityService"]).toBeTruthy();
    });
});