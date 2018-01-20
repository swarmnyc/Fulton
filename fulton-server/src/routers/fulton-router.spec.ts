import * as express from 'express';

import { Middleware, errorHandler, httpDelete, httpGet, httpPut } from "../index";
import { Request, Response } from "../interfaces";
import { getFullRouterMethodMetadata, getRouterMethodMetadataList } from "./route-decorators-helpers";

import { FultonRouter } from "./fulton-router";
import { router } from "./route-decorators";

let middlewares: Middleware[] = [
    function () {

    }
]

@router("/A", "abc")
export class RouterA extends FultonRouter {
    @httpGet()
    list() { }

    @httpGet("/:id")
    get() { }

    @errorHandler()
    error() { }
}

@router("/B", "efg", ...middlewares)
export class RouterB extends FultonRouter {

}

@router("/C")
export class RouterC extends RouterA {
    @httpGet("/list")
    list() { }

    @httpGet("/:key")
    get() { }
}

@router("/D")
export class RouterD extends RouterA {
    @httpPut()
    update() { }

    @httpDelete()
    delete() { }
}

@router("/Food")
export class FoodRouter extends FultonRouter {
    @httpGet()
    list(req: Request, res: Response) { }
}

describe('Fulton Router', () => {
    it('should use router metada', async () => {
        let router = new RouterA();
        let metadata = router["metadata"];
        expect(metadata.router.path).toEqual("/A");
        expect(metadata.router.middlewares).toBeTruthy();
        expect(metadata.methods.length).toEqual(2);
        expect(metadata.methods[1].path).toEqual("/:id");
        expect(metadata.errorhandler).not.toBeUndefined();
    });

    it('should use router metadata for middlewares', async () => {
        let router = new RouterB();
        let metadata = router["metadata"];
        expect(metadata.router.path).toEqual("/B");
        expect(metadata.router.middlewares).toEqual(middlewares);
        expect(metadata.errorhandler).toBeUndefined();
    });

    it('should overwrite router metadata', async () => {
        let router = new RouterC();
        let metadata = router["metadata"];
        expect(metadata.router.path).toEqual("/C");
        expect(metadata.methods.length).toEqual(2);
        expect(metadata.methods[0].path).toEqual("/list");
        expect(metadata.methods[1].path).toEqual("/:key");
        expect(metadata.errorhandler).not.toBeUndefined();
    });

    it('should extend router metada', async () => {
        let router = new RouterD();
        let metadata = router["metadata"];
        expect(metadata.router.path).toEqual("/D");
        expect(metadata.methods.length).toEqual(4);
        expect(metadata.methods[2].path).toEqual("/");
        expect(metadata.methods[3].path).toEqual("/:id");
        expect(metadata.methods[0].method).toEqual("put");
        expect(metadata.methods[1].method).toEqual("delete");
    });

    it('should init router', async () => {
        let router = new FoodRouter();
        let app = express();

        let spy = spyOn(app, "use");
        router["app"] = { express: app } as any;

        router.init();

        expect(spy.calls.count()).toEqual(1);
        expect(spy.calls.argsFor(0)[0]).toEqual("/Food");
    });
});
