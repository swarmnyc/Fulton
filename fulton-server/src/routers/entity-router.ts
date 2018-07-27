import { DiKeys } from '../keys';
import { EntityService } from '../entities/entity-service';
import { EntityServiceFactory, IEntityService, injectable, NextFunction, OperationManyResult, OperationOneResult, OperationResult, Request, Response } from '../interfaces';
import { FullEntityRouterMetadata, getFullEntityRouterActionMetadata } from './route-decorators-helpers';
import { httpDelete, httpGet, httpPatch, httpPost, httpPut } from './route-decorators';
import { Router } from './router';

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
        // by default don't return all entities
        if (req.queryParams.pagination) {
            if (req.queryParams.pagination.index == null)
                req.queryParams.pagination.index = 0;

            if (req.queryParams.pagination.size == null)
                req.queryParams.pagination.size = this.app.options.miscellaneous.paginationSize;
        } else {
            req.queryParams.pagination = {
                index: 0,
                size: this.app.options.miscellaneous.paginationSize
            }
        }

        this.entityService
            .find(req.queryParams)
            .then(this.sendResult(res));
    }

    @httpGet("/:id")
    detail(req: Request, res: Response) {
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
                error: { "message": "no data" }
            });
        }
    }

    @httpPut("/:id")
    @httpPatch("/:id")
    update(req: Request, res: Response) {
        // TODO: determine who can update
        if (req.params.id && req.body.data) {
            this.entityService
                .update(req.params.id, req.body.data)
                .then(this.sendResult(res));
        } else {
            res.status(400).send({
                error: { "message": "no data or id" }
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
                error: { "message": "no id" }
            });
        }
    }

    protected sendResult(res: Response): ((result: OperationManyResult | OperationOneResult | OperationResult) => void) {
        return (result) => {
            if (result.error) {
                res.status(400).send(result);
            } else {
                let status = (<OperationResult>result).status;
                if (status) {
                    res.status(status);
                }
                
                if ((<OperationManyResult>result).data) {
                    res.send(result);
                } else {
                    if (status){
                        res.end()
                    }else{
                        res.status(400).send({
                            error: {
                                "message": "no data"
                            }
                        });
                    }
                }
            }
        }
    }
}