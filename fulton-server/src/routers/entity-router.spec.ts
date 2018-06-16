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
    onInit(){
        this.metadata.actions.get("detail").middlewares = [() => { return "A" }]
    }
}

@entityRouter("/B", Food)
class EntityRouterB extends EntityRouter<Food> {
    constructor(protected entityService: FoodEntityService) {
        super(entityService);
    }

    onInit(){
        this.metadata.actions.get("list").middlewares = [() => { return "B" }]
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

    it('should create instances for EntityRouterB for style 2', async () => {
        let app = new MyApp();
        await app.init();

        let routerA = app.container.get(EntityRouterA);

        expect(routerA.metadata.actions.get("detail").middlewares[0](null, null, null)).toEqual("A")
        expect(routerA.metadata.actions.get("list").middlewares.length).toEqual(0)

        let routerB = app.container.get(EntityRouterB);
        expect(routerB.metadata.actions.get("list").middlewares[0](null, null, null)).toEqual("B")
        expect(routerB.metadata.actions.get("detail").middlewares.length).toEqual(0)
    });
});