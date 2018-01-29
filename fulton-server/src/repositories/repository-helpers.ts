import { FultonDiContainer, Type } from "../index";

import { MongoRepository } from "typeorm/repository/MongoRepository";
import { Repository } from "typeorm/repository/Repository";
import { getConnection } from "typeorm";
import { getRepositoryMetadata } from "./repository-decorator-helper";


/**
 * hack typeorm to create repository, it should only use in FulonApp.initRepository()
 * @param container 
 * @param type 
 */
export function createRepository(container: FultonDiContainer, type: any): Repository<any> {
    let metadata = getRepositoryMetadata(type);

    let connection = getConnection(metadata.connectionName);
    let entityMetadata = connection.getMetadata(metadata.entity);

    let repository = container.resolve(type) as Repository<any>;

    Object.assign(repository, {
        manager: connection.manager,
        metadata: entityMetadata,
        queryRunner: connection.manager.queryRunner,
    });

    connection.manager["repositories"].push(repository);
    return repository;
}