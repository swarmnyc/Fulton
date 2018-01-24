import * as assert from "assert";
import * as lodash from "lodash";

import { ErrorMiddleware, FultonApp, Request, Response, Middleware, asyncWrap } from "../index";
import { FullRouterMetadata, RouterMetadata, getFullRouterMethodMetadata, getRouterMetadata } from "./route-decorators-helpers";
import { FultonDiContainer, PathIdentifier, Inject, Injectable } from "../interfaces";
import { IRouterMatcher, Router } from "express";

import { Identifier } from "../helpers/type-helpers";

/**
 * Express Router Wrap, it uses asyncHandler to support async await
 * 
 * ## example
 * 
 * ```
 * @Router("/Food")
 * export class FoodRouter extends FultonRouter {
 *    @HttpGet()
 *    async list(req: Request, res: Response) { 
 *      return true; //if return true, asyncHandler will all next();
 *    }
 * 
 *    @HttpGet("/:id")
 *    async detail(req: Request, res: Response, next: NextFunction) { 
 *       next(); // call next() yourself;
 *    }
 * 
 *    @HttpPost()
 *    async create(req: Request, res: Response) { 
 *       // if retrun not true,  asyncHandler won't call next();
 *    }
 * }
 * ```
 * 
 */
@Injectable()
export abstract class FultonRouter {
    protected metadata: FullRouterMetadata
    protected router: Router;
    @Inject(FultonApp)
    protected app: FultonApp;

    constructor() {
        this.loadMetadata();
    }

    protected loadMetadata() {
        this.metadata = getFullRouterMethodMetadata(this.constructor);
    }

    init() {
        //TODO: valify metadata;
        this.onInit();

        assert(this.metadata.router, `${this.constructor.name} don't have @router(path) decorator`)
        if (this.metadata.router)

            var router = Router();

        if (lodash.some(this.metadata.router.middlewares)) {
            router.use(...this.metadata.router.middlewares);
        }

        for (const methodMetadata of this.metadata.methods) {
            let routeMethod: IRouterMatcher<any> = lodash.get(router, methodMetadata.method);
            let middlewares: Middleware[] = [];

            if (lodash.some(methodMetadata.middlewares)) {
                middlewares.push(...methodMetadata.middlewares);
            }

            let method = lodash.get(this, methodMetadata.property);
            middlewares.push(asyncWrap(method));

            routeMethod.call(router, methodMetadata.path, middlewares)
        }

        if (this.metadata.errorhandler) {
            router.use(lodash.get(router, this.metadata.errorhandler));
        }

        this.app.server.use(this.metadata.router.path, router);
    }

    protected onInit() { }
}
