import * as typeorm from 'typeorm';

import { column, entity, injectable, objectIdColumn } from '../interfaces';
import { entityRouter, httpGet, router } from "./route-decorators";

import { EntityRouter } from "./entity-router";
import { EntityService } from "../entities/entity-service";
import { FultonApp } from "../fulton-app";
import { FultonAppOptions } from "../options/fulton-app-options";
import { Repository } from "typeorm/repository/Repository";

@entity("foods")
class Food {
    @objectIdColumn()
    id?: string;
    @column()
    name?: String;
    @column()
    category?: String;
}

class FoodRepository extends Repository<Food>{
}

@injectable()
class FoodEntityService extends EntityService<Food> {
}

@entityRouter("/A", Food)
class EntityRouterA extends EntityRouter<Food> {

}

@entityRouter("/B", Food)
class EntityRouterB extends EntityRouter<Food> {
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

    afterAll(() => {
        spy.and.callThrough();
    })

    it('should create instances for EntityRouterA for style 1', async () => {

        let app = new MyApp();
        await app.init();

        let router = app.container.get(EntityRouterA);

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