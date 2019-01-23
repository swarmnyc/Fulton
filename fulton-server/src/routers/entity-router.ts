import { injectable, Request, Response } from '../alias';
import { FultonError } from '../common/fulton-error';
import { IEntityService } from '../types';
import { httpDelete, httpGet, httpPatch, httpPost, httpPut } from './route-decorators';
import { FullEntityRouterMetadata, getFullEntityRouterActionMetadata } from './route-decorators-helpers';
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
            this.entityService = this.app.getEntityService(this.metadata.router.entity)
        }

        super.init();
    }

    @httpGet("/")
    list(req: Request, res: Response) {
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
            .then((result) => {
                res.send(result)
            })
            .catch(this.errorHandler(res));
    }

    @httpGet("/:id")
    detail(req: Request, res: Response) {
        this.entityService
            .findById(req.params.id, req.queryParams)
            .then((entity) => {
                res.send({
                    data: entity
                });
            })
            .catch(this.errorHandler(res));
    }

    @httpPost("/")
    create(req: Request, res: Response) {
        if (req.body.data) {
            this.entityService
                .create(req.body.data)
                .then((entity) => {
                    res.status(201).send({
                        data: entity
                    });
                })
                .catch(this.errorHandler(res));
        } else {
            this.errorHandler(res)(new FultonError("no-data", "no data"))
        }
    }

    @httpPut("/:id")
    @httpPatch("/:id")
    update(req: Request, res: Response) {
        // TODO: determine who can update
        if (req.body.data) {
            this.entityService
                .update(req.params.id, req.body.data)
                .then(() => {
                    res.sendStatus(202);
                })
        } else {
            this.errorHandler(res)(new FultonError("no-data", "no data"))
        }
    }

    @httpDelete("/:id")
    delete(req: Request, res: Response) {
        // TODO: determine who can delete
        if (req.params.id) {
            this.entityService
                .delete(req.params.id)
                .then(() => {
                    res.sendStatus(202);
                })
                .catch(this.errorHandler(res));
        }
    }

    /**
     * handler operation fails
     * @param error 
     */
    protected errorHandler(res: Response): (error: any) => void {
        return (error) => {
            let fe: FultonError
            if ((error instanceof FultonError)) {
                fe = error
            } else {
                fe = new FultonError(error.message)
            }

            res.status(fe.status || 400).send(fe);
        }
    }
}