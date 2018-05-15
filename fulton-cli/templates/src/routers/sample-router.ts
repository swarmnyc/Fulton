import { httpGet, httpPost, Request, Response, router, Router } from 'fulton-server';
import { SampleService } from '../services/sample-service';

@router("/sample")
export class SampleRouter extends Router {
    constructor(private service: SampleService) {
        super();
    }

    @httpGet()
    list(req: Request, res: Response) {
        res.send({ data: this.service.list() });
    }

    @httpGet("/:index")
    detail(req: Request, res: Response) {
        res.send({ data: this.service.get(parseInt(req.params.index)) });
    }

    @httpPost()
    create(req: Request, res: Response) {
        this.service.push(req.body);
        res.sendStatus(200);
    }
}
