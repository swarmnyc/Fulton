import { Article } from '../entities/article';
import { entityRouter, EntityRouter, Request, Response } from 'fulton-server';

@entityRouter("/articles", Article)
export class ArticleRouter extends EntityRouter<Article> {
}
