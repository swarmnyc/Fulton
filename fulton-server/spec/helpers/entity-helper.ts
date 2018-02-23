import { Connection } from 'typeorm';
import { Type } from '../../src/interfaces';
import { IFultonApp } from '../../src/fulton-app';
import { getRelatedToMetadata } from '../../src/entities/entity-decorators-helpers';

export function createFakeConnection(app: IFultonApp) {
    let conn = new Connection({
        type: "mongodb",
        entities: app.options.entities
    });

    conn["buildMetadatas"]();
    app.connections = [conn];
    app.entityMetadatas = new Map();
    app.connections[0].entityMetadatas.forEach((metadata) => {
        metadata.relatedToMetadata = getRelatedToMetadata(metadata.target);
        app.entityMetadatas.set(metadata.target as Type, metadata);
    })

}