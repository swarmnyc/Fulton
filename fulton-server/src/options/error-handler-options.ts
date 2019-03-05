import { ErrorMiddleware, Middleware } from "../alias";
import { default404ErrorHandler, defaultErrorHandler } from '../middlewares/error-handlers';
import { BaseOptions } from './options';

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
        if (this.errorMiddlewares == null || this.errorMiddlewares.length == 0) {
            this.errorMiddlewares = [defaultErrorHandler]
        }

        if (this.error404Middlewares == null || this.error404Middlewares.length == 0) {
            this.error404Middlewares = [default404ErrorHandler]
        }
    }
}