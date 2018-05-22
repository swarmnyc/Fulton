import { httpGet, Request, Response, router, Router } from 'fulton-server';

@router("/${routerPath}")
export class ${className} extends Router {
    @httpGet()
    say(req: Request, res: Response) {
        res.send({ data: ["hello", "world"] });
    }
}
