import { ArticleEntity } from '../entities/article-entity';
import { entityRouter, EntityRouter, Request, Response } from 'fulton-server';

@entityRouter("/articles", ArticleEntity)
export class ArticleRouter extends EntityRouter<ArticleEntity> {
}
