import * as typeorm from "typeorm";

import { injectable } from "../interfaces";
import { KEY_REPOSITORY_METADATA } from "../constants";
import { RepositoryMetadata } from "./repository-decorator-helper";
import { Type } from "../helpers/type-helpers";

// parent have to injectable too.
injectable()(typeorm.Repository)
injectable()(typeorm.MongoRepository)
injectable()(typeorm.TreeRepository)

export function Repo(entity: Type, connectionName: string = "default"): any {
    return function (target: any) {
        injectable()(target);

        Reflect.defineMetadata(
            KEY_REPOSITORY_METADATA,
            {
                entity,
                connectionName
            } as RepositoryMetadata,
            target);
    };
};