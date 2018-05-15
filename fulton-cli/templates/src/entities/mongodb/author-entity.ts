import { entity, column, objectIdColumn, ObjectId } from 'fulton-server';

/**
 * A example of entity for MongoDb, see http://typeorm.io/#/entities for more information
 */
@entity("authors")
export class AuthorEntity {
    @objectIdColumn()
    id: ObjectId;

    @column()
    name: string;

    @column()
    tags: string[];
}