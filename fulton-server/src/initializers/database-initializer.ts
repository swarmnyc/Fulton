import * as lodash from 'lodash';
import { ConnectionOptions } from "typeorm";
import { ClientSecurity } from '../entities/client-security';
import { getRelatedToMetadata } from '../entities/entity-decorators-helpers';
import { FultonApp } from '../fulton-app';
import { Type } from '../interfaces';
import { EventKeys } from "../keys";

module.exports = async function (app: FultonApp): Promise<any> {
    if (app.options.databases.size == 0) {
        // if databases = 0, skip initDatabases
        return;
    }

    initModuleEntities(app)

    let connOptions: ConnectionOptions[] = [];

    app.options.databases.forEach((name, conn) => {
        lodash.set(conn, "name", name);

        // extends entities
        if (lodash.some(app.options.entities)) {
            if (conn.entities) {
                conn.entities.push(...app.options.entities);
            } else {
                lodash.set(conn, "entities", app.options.entities);
            }
        }

        switch (conn.type) {
            case "mongodb":
                lodash.set(conn, "useNewUrlParser", true);
                break;
        }

        connOptions.push(conn);
    });

    app.dbConnections = await (require("typeorm").createConnections(connOptions));

    for (const conn of app.dbConnections) {
        for (const metadata of conn.entityMetadatas) {
            let type = metadata.target as Type;
            if (!app.entityMetadatas.has(type)) {
                metadata.relatedToMetadata = getRelatedToMetadata(type);
                app.entityMetadatas.set(type, metadata)
            }
        }
    }

    app.events.emit(EventKeys.AppDidInitDatabases, app);
}

function initModuleEntities(app: FultonApp) {
    // add security service if security are enabled
    if (app.options.security.enabled) {
        app.options.entities.push(ClientSecurity)
    }
}