import { FullEntityRouterMetadata, getFullEntityRouterActionMetadata } from "./route-decorators-helpers";
import { httpDelete, httpGet, httpPatch, httpPost } from "./route-decorators";
import { IEntityService, injectable, NextFunction, OperationOneResult, OperationManyResult, OperationResult, Request, Response, EntityServiceFactory, DiKeys } from "../interfaces";

import { EntityService } from "../entities/entity-service";
import { Router } from "./router";

@injectable()
export abstract class EntityRouter<TEntity> extends Router {
    public metadata: FullEntityRouterMetadata

    constructor(protected entityService?: IEntityService<TEntity>) {
        super();
    }

    protected loadMetadata() {
        this.metadata = getFullEntityRouterActionMetadata(this.constructor, Router);
    }

    init() {
        if (this.entityService == null) {
            // use default implementation
            let factory = this.app.container.get<EntityServiceFactory>(DiKeys.EntityServiceFactory);
            if (factory instanceof Function) {
                // factory
                this.entityService = factory(this.metadata.router.entity);
            } else {
                // instance
                this.entityService = factory;
            }
        }

        super.init();
    }

    @httpGet("/")
    list(req: Request, res: Response, next: NextFunction) {
        req.queryParams.needAdjust = true;

        // by default don't return all entities
        if (req.queryParams.pagination) {
            if (req.queryParams.pagination.index == null)
                req.queryParams.pagination.index = 0;

            if (req.queryParams.pagination.size == null)
                req.queryParams.pagination.size = this.app.options.settings.paginationSize;
        } else {
            req.queryParams.pagination = {
                index: 0,
                size: this.app.options.settings.paginationSize
            }
        }

        this.entityService
            .find(req.queryParams)
            .then(this.sendResult(res));
    }

    @httpGet("/:id")
    detail(req: Request, res: Response) {
        req.queryParams.needAdjust = true;

        this.entityService
            .findById(req.params.id, req.queryParams)
            .then(this.sendResult(res));
    }

    @httpPost("/")
    create(req: Request, res: Response) {
        if (req.body.data) {
            this.entityService
                .create(req.body.data)
                .then(this.sendResult(res));
        } else {
            res.status(400).send({
                errors: { "message": "no data" }
            });
        }
    }

    @httpPatch("/:id")
    update(req: Request, res: Response) {
        // TODO: determine who can update
        if (req.params.id && req.body.data) {
            this.entityService
                .update(req.params.id, req.body.data)
                .then(this.sendResult(res));
        } else {
            res.status(400).send({
                errors: { "message": "no data or id" }
            });
        }
    }

    @httpDelete("/:id")
    delete(req: Request, res: Response) {
        // TODO: determine who can delete
        if (req.params.id) {
            this.entityService
                .delete(req.params.id)
                .then(this.sendResult(res));
        } else {
            res.status(400).send({
                errors: { "message": "no id" }
            });
        }
    }

    protected sendResult(res: Response): ((result: OperationManyResult | OperationOneResult | OperationResult) => void) {
        return (result) => {
            if (result.errors) {
                res.status(400).send(result);
            } else {
                let status = (<OperationResult>result).status;
                if (status) {
                    res.status(status).end();
                } else if ((<OperationManyResult>result).data) {
                    res.send(result);
                } else {
                    res.status(400).send({
                        errors: {
                            "message": "no data"
                        }
                    });
                }
            }
        }
    }
}