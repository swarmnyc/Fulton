import { Author } from '../entities/author';
import { authorized, entityRouter, EntityRouter, Request, Response } from 'fulton-server';

@entityRouter("/authors", Author, authorized())
export class AuthorRouter extends EntityRouter<Author> {
}
