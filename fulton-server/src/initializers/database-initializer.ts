import * as lodash from 'lodash';

import { Connection, ConnectionOptions } from "typeorm";
import { Type } from '../interfaces';
import { EventKeys } from "../keys"
import { FultonApp } from '../fulton-app';
import { FultonLog } from "../fulton-log";
import { getRelatedToMetadata } from '../entities/entity-decorators-helpers';

module.exports = async function (app: FultonApp): Promise<any> {
    if (app.options.databases.size == 0) {
        // if databases = 0, skip initDatabases
        return;
    }

    let connOptions: ConnectionOptions[] = [];

    app.options.databases.forEach((name, conn) => {
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