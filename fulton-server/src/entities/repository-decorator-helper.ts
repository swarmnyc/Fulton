import { Keys } from "../constants";
import { Type } from "../interfaces";

export interface RepositoryMetadata {
    entity: Type,
    connectionName: string;
}

export function getRepositoryMetadata(target: any): RepositoryMetadata {
    return Reflect.getOwnMetadata(Keys.RepositoryMetadata, target);
}