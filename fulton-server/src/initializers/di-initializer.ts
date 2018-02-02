import { DiContainer, EntityService, EntityServiceFactory, FultonMongoEntityService, Type, RepositoryFactory } from "../index";
import { MongoRepository, getConnection, getRepository } from "typeorm";

import { FultonApp } from "../fulton-app";
import { Repository } from "typeorm/repository/Repository";
import { getRepositoryMetadata } from "../repositories/repository-decorator-helper";
import { interfaces } from "inversify";

module.exports = function (app: FultonApp, container: DiContainer) {
    // for FultonApp
    container.bind(FultonApp).toConstantValue(app);

    // for EntityService
    container.bind(EntityService).toFactory(entityServiceFactory);

    // for Repository
    container.bind(Repository).toFactory(repositoryFactory);
}

/**
 * a factory for create EntityService
 */
function entityServiceFactory<T>(ctx: interfaces.Context): EntityServiceFactory<T> {
    return (entity: Type<T>) => {
        let repo = getRepository(entity); // get repository from typeorm
        let service;
        if (repo instanceof MongoRepository) {
            // for mongo
            service = new FultonMongoEntityService(repo);
            service["app"] = ctx.container.get(FultonApp);
        } else {
            // for sql
            service = new EntityService(repo);
            service["app"] = ctx.container.get(FultonApp);
        }

        return service;
    }
}

/**
 * a factory for hacking typeorm to create repository, so make repository can be injectable
 * it should only be used in FulonApp.initRepository()
 */
function repositoryFactory<T>(ctx: interfaces.Context): RepositoryFactory<T> {
    return (repoType: Type<T>) => {
        let metadata = getRepositoryMetadata(repoType);

        let connection = getConnection(metadata.connectionName);
        let entityMetadata = connection.getMetadata(metadata.entity);

        let repository = ctx.container.resolve<any>(repoType) as Repository<T>;

        Object.assign(repository, {
            manager: connection.manager,
            metadata: entityMetadata,
            queryRunner: connection.manager.queryRunner,
        });

        connection.manager["repositories"].push(repository);
        return repository;
    }

}