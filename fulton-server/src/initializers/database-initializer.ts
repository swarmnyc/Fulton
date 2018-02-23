import * as lodash from 'lodash';

import { Connection, ConnectionOptions, createConnections } from "typeorm";
import { EventKeys, Type } from '../interfaces';

import { FultonApp } from '../fulton-app';
import { FultonLog } from "../fulton-log";
import { getRelatedToMetadata } from '../entities/entity-decorators-helpers';

module.exports = async function (app: FultonApp): Promise<any> {
    if (app.options.identity.isUseDefaultImplement) {
        // add User Entity to typeorm if identity is enabled and use FultonUser and FultonUserService
        app.options.entities.push(app.options.identity.userType);
    } else if (app.options.databases.size == 0) {
        // if databases = 0 and repositories = 0, skip initDatabases
        if (lodash.isEmpty(app.options.repositories) && app.options.loader.repositoryLoaderEnabled == false)
            return;
    }

    let connOptions: ConnectionOptions[] = [];

    app.options.databases.forEach((conn, name) => {
        lodash.set(conn, "name", name);

        // extends entities
        if (lodash.some(app.options.entities)) {
            if (conn.entities) {
                let arr = conn.entities as any[];
                arr.push(app.options.entities);
            } else {
                lodash.set(conn, "entities", app.options.entities);
            }
        }

        connOptions.push(conn);
    });


    app.connections = await createConnections(connOptions).catch((error) => {
        FultonLog.error("initDatabases fails", error);
        throw error;
    });

    for (const conn of app.connections) {
        for (const metadata of conn.entityMetadatas) {
            let type = metadata.target as Type;
            if (!app.entityMetadatas.has(type)) {
                metadata.relatedToMetadata = getRelatedToMetadata(type);
                app.entityMetadatas.set(type, metadata)
            }
        }
    }

    app.events.emit(EventKeys.didInitDatabases, app);
}