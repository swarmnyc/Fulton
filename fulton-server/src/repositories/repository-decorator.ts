import * as typeorm from "typeorm";

import { Injectable } from "../interfaces";
import { KEY_REPOSITORY_METADATA } from "../constants";
import { RepositoryMetadata } from "./repository-decorator-helper";
import { Type } from "../helpers/type-helpers";

// parent have to Injectable too.
Injectable()(typeorm.Repository)
Injectable()(typeorm.MongoRepository)
Injectable()(typeorm.TreeRepository)

export function Repository(entity: Type, connectionName: string = "default"): any {
    return function (target: any) {
        Injectable()(target);

        Reflect.defineMetadata(
            KEY_REPOSITORY_METADATA,
            {
                entity,
                connectionName
            } as RepositoryMetadata,
            target);
    };
};