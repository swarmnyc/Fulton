import { AuthorEntity } from './author-entity';
import { column, entity, objectIdColumn, relatedTo, ObjectId } from 'fulton-server';

/**
 * A example of entity for MongoDb, see http://typeorm.io/#/entities for more information
 */
@entity("articles")
export class ArticleEntity {
    @objectIdColumn()
    id: ObjectId;

    @column()
    releasedAt: Date;

    @relatedTo(AuthorEntity)
    author: AuthorEntity;

    @column()
    tags: string[];
}