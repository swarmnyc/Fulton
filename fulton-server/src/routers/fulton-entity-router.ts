import { FullEntityRouterMetadata, getFullEntityRouterMethodMetadata } from "./route-decorators-helpers";
import { HttpDelete, HttpGet, HttpPatch, HttpPost } from "./route-decorators";

import { FultonRouter } from "./fulton-router";
import { IEntityService, Injectable, NextFunction, Request, Response, OperationResult, OperationOneResult } from "../interfaces";
import { createEntityService } from "../services/fulton-entity-service-helper";
import { queryById } from "../middlewares/query-params-parser";
import { OperationStatus } from "../index";

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

    @HttpGet("/:id", queryById())
    detail(req: Request, res: Response) {
        this.entityService
            .findOne(req.queryParams)
            .then(this.sendResult(res));
    }

    @HttpPost("/")
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

    @HttpPatch("/:id")
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

    @HttpDelete("/:id")
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
                let status = (result as OperationStatus).status;
                if (status) {
                    res.status(status).end();
                } else {
                    res.send(result);
                }
            }
        }
    }
}