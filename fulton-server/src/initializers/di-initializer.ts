import { EntityService, FultonDiContainer, FultonMongoEntityService, Type } from "../index";
import { MongoRepository, getRepository } from "typeorm";

import { FultonApp } from "../fulton-app";

module.exports = function (app: FultonApp, container: FultonDiContainer) {
    // for FultonApp
    container.bind(FultonApp).toConstantValue(app);

    // for EntityService
    container.bind(EntityService).toFactory((ctx) => {
        return (entity: Type) => {
            let repo = getRepository(entity);
            let service;
            if (repo instanceof MongoRepository) {
                // for mongo
                service = new FultonMongoEntityService(repo);
                service["app"] = app;
            } else {
                // for sql
                service = new EntityService(repo);
                service["app"] = app;
            }
    
            return service;
        }
    });
}