import * as express from 'express';

import { Middleware, errorHandler, HttpDelete, HttpGet, HttpPut } from "../index";
import { Request, Response } from "../interfaces";
import { getFullRouterMethodMetadata, getRouterMethodMetadataList } from "./route-decorators-helpers";

import { FultonRouter } from "./fulton-router";
import { Router } from "./route-decorators";

let middleware: Middleware = function () {

}

let middlewares: Middleware[] = [
    middleware, middleware, middleware
]

@Router("/A", { title: "RouterA" })
export class RouterA extends FultonRouter {
    @HttpGet()
    list() { }

    @HttpGet("/:id", { title: "Get" })
    get() { }

    @errorHandler()
    error() { }
}

@Router("/B", { title: "RouterB" }, ...middlewares)
export class RouterB extends FultonRouter {

}

@Router("/C", middleware)
export class RouterC extends RouterA {
    @HttpGet("/list", middleware, middleware)
    list() { }

    @HttpGet("/:key", { title: "get" }, ...middlewares)
    get() { }
}

@Router("/D", middleware, middleware)
export class RouterD extends RouterA {
    @HttpPut("/", ...middlewares)
    update() { }

    @HttpDelete()
    delete() { }
}

@Router("/Food")
export class FoodRouter extends FultonRouter {
    @HttpGet()
    list(req: Request, res: Response) { }
}

describe('Fulton Router', () => {
    it('should use router metada', async () => {
        let router = new RouterA();
        let metadata = router["metadata"];
        expect(metadata.router.path).toEqual("/A");
        expect(metadata.router.doc.title).toEqual("RouterA");
        expect(metadata.router.middlewares.length).toEqual(0);

        expect(metadata.methods.length).toEqual(2);
        expect(metadata.methods[0].path).toEqual("/");

        expect(metadata.methods[1].path).toEqual("/:id");
        expect(metadata.methods[1].doc.title).toEqual("Get");

        expect(metadata.errorhandler).not.toBeUndefined();
    });

    it('should use router metadata for middlewares', async () => {
        let router = new RouterB();
        let metadata = router["metadata"];
        expect(metadata.router.path).toEqual("/B");
        expect(metadata.router.doc.title).toEqual("RouterB");
        expect(metadata.router.middlewares.length).toEqual(3);
        expect(metadata.errorhandler).toBeUndefined();
    });

    it('should overwrite router metadata', async () => {
        let router = new RouterC();
        let metadata = router["metadata"];
        expect(metadata.router.path).toEqual("/C");
        expect(metadata.router.doc).toBeUndefined();
        expect(metadata.router.middlewares.length).toEqual(1);
        expect(metadata.methods.length).toEqual(2);

        expect(metadata.methods[0].path).toEqual("/list");
        expect(metadata.methods[0].doc).toBeUndefined();
        expect(metadata.methods[0].middlewares.length).toEqual(2);

        expect(metadata.methods[1].path).toEqual("/:key");
        expect(metadata.methods[1].doc.title).toEqual("get");        
        expect(metadata.methods[1].middlewares.length).toEqual(3);
        
        expect(metadata.errorhandler).not.toBeUndefined();
    });

    it('should extend router metada', async () => {
        let router = new RouterD();
        let metadata = router["metadata"];
        expect(metadata.router.path).toEqual("/D");
        expect(metadata.router.doc).toBeUndefined();
        expect(metadata.router.middlewares.length).toEqual(2);
        expect(metadata.methods.length).toEqual(4);
        expect(metadata.methods[2].path).toEqual("/");
        expect(metadata.methods[3].path).toEqual("/:id");

        expect(metadata.methods[0].method).toEqual("put");
        expect(metadata.methods[0].middlewares.length).toEqual(3);        
        expect(metadata.methods[1].method).toEqual("delete");
    });

    it('should init router', async () => {
        let router = new FoodRouter();
        let app = express();

        let spy = spyOn(app, "use");
        router["app"] = { server: app } as any;

        router.init();

        expect(spy.calls.count()).toEqual(1);
        expect(spy.calls.argsFor(0)[0]).toEqual("/Food");
    });
});
