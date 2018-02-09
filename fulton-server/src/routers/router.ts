import * as assert from "assert";
import * as lodash from "lodash";

import { ErrorMiddleware, FultonApp, Request, Response, Middleware } from "../index";
import { FullRouterMetadata, RouterMetadata, getFullRouterMethodMetadata, getRouterMetadata } from "./route-decorators-helpers";
import { DiContainer, PathIdentifier, inject, injectable } from "../interfaces";
import { IRouterMatcher, Router as ExpressRouter } from "express";

import { TypeIdentifier } from "../helpers/type-helpers";

/**
 * Express Router Wrap
 * 
 * ## example
 * 
 * ```
 * @router("/Food")
 * export class FoodRouter extends Router {
 *    @httpGet()
 *    list(req: Request, res: Response) { 
 *    }
 * 
 *    @httpGet("/:id")
 *    detail(req: Request, res: Response, next: NextFunction) { 
 *    }
 * 
 *    @httpPost("/")
 *    create(req: Request, res: Response) { 
 *    }
 * }
 * ```
 * 
 */
@injectable()
export abstract class Router {
    public metadata: FullRouterMetadata
    protected router: Router;
    @inject(FultonApp)
    protected app: FultonApp;

    constructor() {
        this.loadMetadata();
    }

    protected loadMetadata() {
        this.metadata = getFullRouterMethodMetadata(this.constructor);
    }

    init() {
        //TODO: verify metadata;
        this.onInit();

        assert(this.metadata.router, `${this.constructor.name} don't have @router(path) decorator`)
        if (this.metadata.router)

            var router = ExpressRouter();

        if (lodash.some(this.metadata.router.middlewares)) {
            router.use(...this.metadata.router.middlewares);
        }

        for (const action of this.metadata.actions) {
            let routeMethod: IRouterMatcher<any> = lodash.get(router, action.method);
            let middlewares: Middleware[] = [];

            if (lodash.some(action.middlewares)) {
                middlewares.push(...action.middlewares);
            }

            let method: Middleware = lodash.get(this, action.property);
            method = method.bind(this);
            middlewares.push(method);

            routeMethod.call(router, action.path, middlewares)
        }

        if (this.metadata.errorhandler) {
            router.use(lodash.get(router, this.metadata.errorhandler));
        }

        this.app.express.use(this.metadata.router.path, router);
    }

    protected onInit() { }
}
