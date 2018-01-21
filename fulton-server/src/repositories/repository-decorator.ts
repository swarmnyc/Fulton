import { KEY_REPOSITORY_METADATA } from "../constants";
import { RepositoryMetadata } from "./repository-decorator-helper";
import { Type } from "../helpers/type-helpers";
import { injectable } from "../interfaces";
import { MongoRepository, Repository, TreeRepository } from "typeorm";


// parent have to injectable too.
injectable()(Repository)
injectable()(MongoRepository)
injectable()(TreeRepository)

export function repository(entity: Type, connectionName: string = "default"): any {
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