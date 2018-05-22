import { httpGet, httpPost, Request, Response, router, Router } from 'fulton-server';
import { SampleService } from '../services/sample-service';

@router("/${routerPath}")
export class ${className} extends Router {
    @httpGet()
    say(req: Request, res: Response) {
        res.send({ data: ["hello", "world"] });
    }
}
