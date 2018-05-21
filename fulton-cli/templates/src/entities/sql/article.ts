import { Author } from './author';
import { column, entity, primaryGeneratedColumn, manyToOne } from 'fulton-server';

/**
 * A example of entity for SQL, see http://typeorm.io/#/entities for more information
 */
@entity("articles")
export class Article {
    @primaryGeneratedColumn("uuid")
    id: string;

    @column()
    releasedAt: Date;

    @manyToOne(type=>Author)
    author: Author;

    @column()
    tags: string[];
}