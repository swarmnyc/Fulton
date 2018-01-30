import { FullEntityRouterMetadata, getFullEntityRouterMethodMetadata } from "./route-decorators-helpers";
import { HttpDelete, HttpGet, HttpPatch, HttpPost } from "./route-decorators";
import { Injectable, NextFunction, Request, Response } from "../index";

import { FultonRouter } from "./fulton-router";
import { IEntityService } from "../interfaces";
import { createEntityService } from "../services/fulton-entity-service-helper";

@Injectable()
export abstract class FultonEntityRouter<TEntity> extends FultonRouter {
    protected metadata: FullEntityRouterMetadata

    constructor(protected entityService?: IEntityService<TEntity>) {
        super();
    }

    protected loadMetadata() {
        this.metadata = getFullEntityRouterMethodMetadata(this.constructor);
    }

    init() {
        if (this.entityService == null) {
            // use default implementation
            this.entityService = createEntityService(this.metadata.router.entity, this.app);
        }

        super.init();
    }

    @HttpGet("/")
    list(req: Request, res: Response, next: NextFunction) {
        this.entityService
            .find(req.queryParams)
            .then((result) => {
                res.send(result);
            })
            .catch((err: any) => {
                next(err);
            });
    }

    @HttpGet("/:id")
    detail(req: Request, res: Response) {

    }

    @HttpPost("/")
    create(req: Request, res: Response) {

    }

    @HttpPatch("/:id")
    update(req: Request, res: Response) {

    }

    @HttpDelete("/:id")
    delete(req: Request, res: Response) {

    }
}