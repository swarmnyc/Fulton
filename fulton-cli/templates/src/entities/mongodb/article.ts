import { Author } from './author';
import { column, entity, objectIdColumn, relatedTo, ObjectId } from 'fulton-server';

/**
 * A example of entity for MongoDb, see http://typeorm.io/#/entities for more information
 */
@entity("articles")
export class Article {
    @objectIdColumn()
    id: ObjectId;

    @column()
    releasedAt: Date;

    @relatedTo(Author)
    author: Author;

    @column()
    tags: string[];
}