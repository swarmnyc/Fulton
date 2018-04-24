import { Middleware, ErrorMiddleware } from "../interfaces";
import { BaseOptions } from './options';
import { Env } from "../helpers";

export class FormatterOptions extends BaseOptions<FormatterOptions> {
    /**
     * if true, add express.json() as a middleware
     * the default value is true
     */
    json?: boolean = true;

    /**
     * if true, add fulton Jsonapi() as a middleware
     * if true, have to run `npm install jsonapi-serializer`
     * the default value is false
     */
    jsonApi?: boolean = false;

    /**
     * if true, add express.urlencoded({ extended: true })() as a middleware
     * the default value is true
     */
    form?: boolean = true;

    /**
     * it true, add queryParamsParser as a middleware
     */
    queryParams?: boolean = true;

    /**
     * other custom middlewares
     */
    customs?: Middleware[] = [];
}