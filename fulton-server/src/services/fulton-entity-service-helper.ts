import { Type } from "../index";
import { getRepository } from "typeorm";
import { MongoEntityService } from "./fulton-mongo-entity-service";
import { EntityService } from "./fulton-entity-service";
import { IEntityService } from "../interfaces";
import { MongoRepository } from "typeorm/repository/MongoRepository";
import { FultonApp } from "../fulton-app";


export function createEntityService<T>(entity: Type<T>, app: FultonApp): IEntityService<T> {
    if (app.container.isBound(EntityService)) {
        // for mock
        return app.container.get(EntityService);
    } else {
        let repo = getRepository(entity);
        let service;
        if (repo instanceof MongoRepository) {
            // for mongo
            service = new MongoEntityService(repo);
            service["app"] = app;
        } else {
            // for sql
            service = new EntityService(repo);
            service["app"] = app;
        }

        return service;
    }
}