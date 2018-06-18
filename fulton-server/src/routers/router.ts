import * as assert from "assert";
import * as lodash from "lodash";

import { Router as ExpressRouter, IRouterMatcher } from "express";
import { FullRouterMetadata, getFullRouterActionMetadata } from "./route-decorators-helpers";
import { Middleware, inject, injectable } from "../interfaces";

import { DiKeys } from "../keys";
import { IFultonApp } from '../fulton-app';
import { OpenApiSpec } from "@loopback/openapi-spec";

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

    @inject(DiKeys.FultonApp)
    protected app: IFultonApp;

    constructor() {
        this.loadMetadata();
    }

    protected loadMetadata() {
        this.metadata = getFullRouterActionMetadata(this.constructor, Router);
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

        this.metadata.actions.forEach((action) => {
            let routeMethod: IRouterMatcher<any> = lodash.get(router, action.method);
            let middlewares: Middleware[] = [];

            if (lodash.some(action.middlewares)) {
                middlewares.push(...action.middlewares);
            }

            let method: Middleware = lodash.get(this, action.property);
            method = method.bind(this);
            middlewares.push(method);

            routeMethod.call(router, action.path, middlewares)
        })

        if (this.metadata.errorhandler) {
            router.use(lodash.get(router, this.metadata.errorhandler));
        }

        this.app.express.use(this.metadata.router.path, router);
    }

    /**
     * custom function for initialization 
     */
    protected onInit() { }

    /**
     * custom function for documentation
     */
    protected onDocument(docs: OpenApiSpec) { }
}
