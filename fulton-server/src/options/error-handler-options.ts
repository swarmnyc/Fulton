import { Middleware, ErrorMiddleware } from "../interfaces";
import { BaseOptions } from './options';
import { Env } from "../helpers";
import { default404ErrorHandler, defaultErrorHandler } from '../middlewares/error-handlers';

export class ErrorHandlerOptions extends BaseOptions<ErrorHandlerOptions> {
    /**
     * middlewares for error, default is [fultonDefaultErrorHandler]
     */
    errorMiddlewares?: ErrorMiddleware[] = []

    /**
     * middlewares for 404 error, default is [fultonDefault404ErrorHandler]
     */
    error404Middlewares?: Middleware[] = []

    init?(): void {
        if (this.error404Middlewares || this.error404Middlewares.length == 0) {
            this.errorMiddlewares = [defaultErrorHandler]
        }

        if (this.error404Middlewares || this.error404Middlewares.length == 0) {
            this.error404Middlewares = [default404ErrorHandler]
        }
    }
}