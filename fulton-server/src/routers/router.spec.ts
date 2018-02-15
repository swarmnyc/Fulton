import * as express from 'express';

import { Middleware, errorHandler, authenticate, authorized, authorizedByRole } from "../index";
import { Request, Response } from "../interfaces";
import { getFullRouterMethodMetadata, getRouterMethodMetadataList } from "./route-decorators-helpers";

import { Router } from "./router";
import { router, httpPost, httpDelete, httpGet, httpPut } from "./route-decorators";

let middleware: Middleware = function () {

}

let middlewares: Middleware[] = [
    middleware, middleware, middleware
]

@router("/A", { title: "RouterA" })
export class RouterA extends Router {
    @httpGet()
    list() { }

    @httpGet("/:id", { title: "Get" })
    get() { }

    @errorHandler()
    error() { }
}

@router("/B", { title: "RouterB" }, ...middlewares)
export class RouterB extends Router {

}

@router("/C", middleware)
export class RouterC extends RouterA {
    @httpGet("/list", middleware, middleware)
    list() { }

    @httpGet("/:key", { title: "get" }, ...middlewares)
    get() { }
}

@router("/D", middleware, middleware)
export class RouterD extends RouterA {
    @httpPut("/", ...middlewares)
    update() { }

    @httpDelete()
    delete() { }
}

// router level authorization
@router("/Food")
export class FoodRouter extends Router {
    // all actions needs to be authorized
    @httpGet()
    list(req: Request, res: Response) { }

    @httpGet("/:id")
    detail(req: Request, res: Response) { }
}

@router("/auth")
export class AuthRouter extends Router {
    @httpGet("/login")
    loginView(req: Request, res: Response) {
        res.render("login");
    }

    @httpPost("/login", authenticate("local", { failureRedirect: "/auth/login" }))
    login(req: Request, res: Response) {
        res.redirect("/");
    }
}

describe('Fulton Router', () => {
    it('should use router metadata', async () => {
        let router = new RouterA();
        let metadata = router["metadata"];
        expect(metadata.router.path).toEqual("/A");
        expect(metadata.router.doc.title).toEqual("RouterA");
        expect(metadata.router.middlewares.length).toEqual(0);

        expect(metadata.actions.length).toEqual(2);
        expect(metadata.actions[0].path).toEqual("/");

        expect(metadata.actions[1].path).toEqual("/:id");
        expect(metadata.actions[1].doc.title).toEqual("Get");

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
        expect(metadata.router.doc).toEqual({});
        expect(metadata.router.middlewares.length).toEqual(1);
        expect(metadata.actions.length).toEqual(2);

        expect(metadata.actions[0].path).toEqual("/list");
        expect(metadata.actions[0].doc).toEqual({});
        expect(metadata.actions[0].middlewares.length).toEqual(2);

        expect(metadata.actions[1].path).toEqual("/:key");
        expect(metadata.actions[1].doc.title).toEqual("get");
        expect(metadata.actions[1].middlewares.length).toEqual(3);

        expect(metadata.errorhandler).not.toBeUndefined();
    });

    it('should extend router metadata', async () => {
        let router = new RouterD();
        let metadata = router["metadata"];
        expect(metadata.router.path).toEqual("/D");
        expect(metadata.router.doc).toEqual({});
        expect(metadata.router.middlewares.length).toEqual(2);
        expect(metadata.actions.length).toEqual(4);
        expect(metadata.actions[2].path).toEqual("/");
        expect(metadata.actions[3].path).toEqual("/:id");

        expect(metadata.actions[0].method).toEqual("put");
        expect(metadata.actions[0].middlewares.length).toEqual(3);
        expect(metadata.actions[1].method).toEqual("delete");
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
