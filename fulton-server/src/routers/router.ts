import { OpenApiSpec } from "@loopback/openapi-spec";
import * as assert from "assert";
import { IRouterMatcher, Router as ExpressRouter } from "express";
import * as lodash from "lodash";
import { inject, injectable, Middleware } from "../alias";
import { IFultonApp } from '../fulton-app';
import { DiKeys } from "../keys";
import { FullRouterMetadata, getFullRouterActionMetadata } from "./route-decorators-helpers";

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

		var router = ExpressRouter();

		if (this.metadata.router && lodash.some(this.metadata.router.middlewares)) {
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
