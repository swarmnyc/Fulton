import { Container, interfaces } from 'inversify';
import { DiKeys, EventKeys } from '../keys';
import { EntityService } from '../entities';
import { EntityServiceFactory, RepositoryFactory, Type } from '../interfaces';
import { FultonApp } from '../fulton-app';
import { getConnection, getRepository, MongoRepository, Repository } from 'typeorm';
import { getRepositoryMetadata } from '../entities/repository-decorator-helper';

module.exports = function (app: FultonApp) {
    app.container = new Container();

    // for FultonApp
    app.container.bind(DiKeys.FultonApp).toConstantValue(app);

    // for EntityService
    app.container.bind(DiKeys.EntityServiceFactory).toFactory(entityServiceFactory);

    // for EntityRunner
    app.container.bind(DiKeys.MongoEntityRunner).toDynamicValue((ctx) => {
        // lazy require
        let runner = require("../entities/runner/mongo-entity-runner").MongoEntityRunner;
        return ctx.container.resolve(runner);
    }).inSingletonScope();

    app.events.emit(EventKeys.AppDidInitDiContainer, app);
}

/**
 * a factory for create EntityService
 */
function entityServiceFactory<T>(ctx: interfaces.Context): EntityServiceFactory<T> {
    return (entity: Type<T>) => {
        let service = new EntityService(entity);
        service["app"] = ctx.container.get(DiKeys.FultonApp);

        return service;
    }
}