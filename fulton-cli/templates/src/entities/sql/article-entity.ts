import { AuthorEntity } from './author-entity';
import { column, entity, primaryGeneratedColumn, manyToOne } from 'fulton-server';

/**
 * A example of entity for SQL, see http://typeorm.io/#/entities for more information
 */
@entity("articles")
export class ArticleEntity {
    @primaryGeneratedColumn("uuid")
    id: string;

    @column()
    releasedAt: Date;

    @manyToOne(type=>AuthorEntity)
    author: AuthorEntity;

    @column()
    tags: string[];
}