import { FultonEntityRouter, FultonRouter, Middleware, Request, Response, Injectable, HttpGet, Router } from "fulton-server"

@Router("/food")
export class FoodRouter extends FultonRouter {
    // constructor( @Inject private foodDataService: FoodEntityService) {
    //     super(foodDataService)

    //     this.detailDelegate = this.foodDataService.findByName;
    // }

    @HttpGet()
    get(req: Request, res: Response) {
        res.send("works");
    }

    // @Get("other/:id")
    // other2(context: IFultonRouterContext) {
    //     context.body = "other2"
    // }
}