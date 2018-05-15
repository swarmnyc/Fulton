import { AuthorEntity } from '../entities/author-entity';
import { authorized, entityRouter, EntityRouter, Request, Response } from 'fulton-server';

@entityRouter("/authors", AuthorEntity, authorized())
export class AuthorRouter extends EntityRouter<AuthorEntity> {
}
