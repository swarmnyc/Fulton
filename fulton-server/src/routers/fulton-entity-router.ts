import { FullEntityRouterMetadata, getFullEntityRouterMethodMetadata } from "./route-decorators-helpers";
import { HttpDelete, HttpGet, HttpPatch, HttpPost } from "./route-decorators";
import { Injectable, NextFunction, Request, Response } from "../index";

import { FultonRouter } from "./fulton-router";
import { IEntityService } from "../interfaces";
import { createEntityService } from "../services/fulton-entity-service-helper";
import { queryById } from "../middlewares/query-params-parser";

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
            .then((result) => {
                if (result.errors) {
                    res.status(400).send(result);
                } else {
                    res.send(result);
                }
            })
    }

    @HttpGet("/:id", queryById())
    detail(req: Request, res: Response) {
        this.entityService
            .findOne(req.queryParams)
            .then((result) => {
                if (result.errors) {
                    res.status(400).send(result);
                } else {
                    res.send(result);
                }
            })
    }

    @HttpPost("/")
    create(req: Request, res: Response) {
        if (req.body.data) {
            this.entityService
                .create(req.body.data)
                .then((result) => {
                    if (result.errors) {
                        res.status(400).send(result);
                    } else {
                        res.send(result);
                    }
                });
        } else {
            res.status(400).send({
                status: "error",
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
                .then((result) => {
                    if (result.errors) {
                        res.status(400).send(result);
                    } else {
                        res.send(result);
                    }
                });
        } else {
            res.status(400).send({
                status: "error",
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
                .then((result) => {
                    if (result.errors) {
                        res.status(400).send(result);
                    } else {
                        res.send(result);
                    }
                });
        } else {
            res.status(400).send({
                status: "error",
                errors: { "message": "no id" }
            });
        }
    }
}