import { FullEntityRouterMetadata, getFullEntityRouterMethodMetadata } from "./route-decorators-helpers";
import { httpDelete, httpGet, httpPatch, httpPost } from "./route-decorators";
import { IEntityService, injectable, NextFunction, OperationOneResult, OperationResult, OperationStatus, Request, Response, EntityServiceFactory } from "../interfaces";

import { EntityService } from "../services";
import { Router } from "./router";
import { queryById } from "../middlewares";

@injectable()
export abstract class EntityRouter<TEntity> extends Router {
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
            let factory: EntityServiceFactory<TEntity> = this.app.container.get<any>(EntityService);
            this.entityService = factory(this.metadata.router.entity);
        }

        super.init();
    }

    @httpGet("/")
    list(req: Request, res: Response, next: NextFunction) {
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

    @httpGet("/:id", queryById())
    detail(req: Request, res: Response) {
        this.entityService
            .findOne(req.queryParams)
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

    protected sendResult(res: Response): ((result: OperationResult | OperationOneResult | OperationStatus) => void) {
        return (result) => {
            if (result.errors) {
                res.status(400).send(result);
            } else {
                let status = (<OperationStatus>result).status;
                if (status) {
                    res.status(status).end();
                } else {
                    res.send(result);
                }
            }
        }
    }
}