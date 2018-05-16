import { Container, interfaces } from 'inversify';
import { DiKeys, EventKeys } from '../keys';
import { EntityServiceFactory, Type } from '../interfaces';
import { IFultonApp } from '../fulton-app';

module.exports = function (app: IFultonApp) {
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
        let service = new (require("../entities/entity-service").EntityService)(entity);
        service["app"] = ctx.container.get(DiKeys.FultonApp);

        return service;
    }
}