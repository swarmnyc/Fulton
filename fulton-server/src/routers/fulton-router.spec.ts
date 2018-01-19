import { Middleware, httpGet } from "../index";

import { FultonRouter } from "./fulton-router";
import { router } from "./route-decorators";

let beforeMiddlewares: Middleware[] = [
    function () {

    }
]

let afterMiddlewares: Middleware[] = [
    function () {

    }
]

@router("/A", "abc")
export class RouterA extends FultonRouter {
    @httpGet()
    get() {
        
    }
}

@router("/B", "efg", beforeMiddlewares, afterMiddlewares)
export class RouterB extends FultonRouter {

}

describe('Fulton Router', () => {
    it('should use router metada', async () => {
        let routerA = new RouterA();

        expect(routerA.path).toEqual("/A");
        expect(routerA["metadata"].afterMiddlewares).toBeFalsy();
        expect(routerA["metadata"].beforeMiddlewares).toBeFalsy();

        let routerB = new RouterB();
        expect(routerB.path).toEqual("/B");
        expect(routerB["metadata"].afterMiddlewares).toEqual(afterMiddlewares);
        expect(routerB["metadata"].beforeMiddlewares).toEqual(beforeMiddlewares);
    });
});
