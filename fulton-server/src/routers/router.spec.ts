import * as express from 'express';
import { Middleware, Request, Response } from "../alias";
import { authenticate } from '../identity/authenticate-middlewares';
import { errorHandler, httpDelete, httpGet, httpPost, httpPut, router } from './route-decorators';
import { Router } from "./router";

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

        expect(metadata.actions.size).toEqual(2);
        expect(metadata.actions.get("list").path).toEqual("/");

        expect(metadata.actions.get("get").path).toEqual("/:id");
        expect(metadata.actions.get("get").doc.title).toEqual("Get");

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
        expect(metadata.actions.size).toEqual(2);

        expect(metadata.actions.get("list").path).toEqual("/list");
        expect(metadata.actions.get("list").doc).toEqual({});
        expect(metadata.actions.get("list").middlewares.length).toEqual(2);

        expect(metadata.actions.get("get").path).toEqual("/:key");
        expect(metadata.actions.get("get").doc.title).toEqual("get");
        expect(metadata.actions.get("get").middlewares.length).toEqual(3);

        expect(metadata.errorhandler).not.toBeUndefined();
    });

    it('should extend router metadata', async () => {
        let router = new RouterD();
        let metadata = router["metadata"];
        expect(metadata.router.path).toEqual("/D");
        expect(metadata.router.doc).toEqual({});
        expect(metadata.router.middlewares.length).toEqual(2);
        expect(metadata.actions.size).toEqual(4);
        expect(metadata.actions.get("list").path).toEqual("/");
        expect(metadata.actions.get("get").path).toEqual("/:id");

        expect(metadata.actions.get("update").method).toEqual("put");
        expect(metadata.actions.get("update").middlewares.length).toEqual(3);
        expect(metadata.actions.get("delete").method).toEqual("delete");
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
