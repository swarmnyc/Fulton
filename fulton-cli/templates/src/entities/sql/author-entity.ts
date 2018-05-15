import { entity, column, primaryGeneratedColumn } from 'fulton-server';

/**
 * A example of entity for Sql, see http://typeorm.io/#/entities for more information
 */
@entity("authors")
export class AuthorEntity {
    @primaryGeneratedColumn("uuid")
    id: string;

    @column()
    name: string;

    @column()
    tags: string[];
}