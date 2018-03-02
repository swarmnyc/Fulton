import * as typeorm from "typeorm";

import { injectable, Type } from "../interfaces";
import { Keys } from "../constants";
import { RepositoryMetadata } from "./repository-decorator-helper";

// parent have to injectable too.
injectable()(typeorm.Repository)
injectable()(typeorm.MongoRepository)
injectable()(typeorm.TreeRepository)

export function repository(entity: Type, connectionName: string = "default"): any {
    return function (target: any) {
        injectable()(target);

        Reflect.defineMetadata(
            Keys.RepositoryMetadata,
            {
                entity,
                connectionName
            } as RepositoryMetadata,
            target);
    };
};