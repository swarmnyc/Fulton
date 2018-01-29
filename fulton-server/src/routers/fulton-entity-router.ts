import { FultonRouter } from "./fulton-router";
import { Request, Response, Injectable } from "../index";
import { getFullEntityRouterMethodMetadata, FullEntityRouterMetadata } from "./route-decorators-helpers";
import { HttpGet, HttpPost, HttpPatch, HttpDelete } from "./route-decorators";
import { FultonEntityService } from "../services/fulton-entity-service";
import { getRepository } from "typeorm";

@Injectable()
export abstract class FultonEntityRouter<TEntity> extends FultonRouter {
    protected metadata: FullEntityRouterMetadata

    constructor(protected entityService?: FultonEntityService<TEntity>) {
        super();
    }

    protected loadMetadata() {
        this.metadata = getFullEntityRouterMethodMetadata(this.constructor);
    }

    init() {
        // use default implementation 
        if (this.entityService == null) {
            let repo = getRepository(this.metadata.router.entity);
            this.entityService = new FultonEntityService(repo);
        }

        super.init();
    }

    @HttpGet("/")
    list(req: Request, res: Response) {

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