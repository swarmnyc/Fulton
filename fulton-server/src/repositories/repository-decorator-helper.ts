import { KEY_REPOSITORY_METADATA } from "../constants";
import { Type } from "../index";

export interface RepositoryMetadata {
    entity: Type,
    connectionName: string;
}

export function getRepositoryMetadata(target: any): RepositoryMetadata {
    return Reflect.getOwnMetadata(KEY_REPOSITORY_METADATA, target);
}