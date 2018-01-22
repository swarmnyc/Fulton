import { FultonEntityRouter, FultonRouter, Middleware, Request, Response, httpGet, Injectable, router } from "fulton-server"

@router("/food")
export class FoodRouter extends FultonRouter {
    // constructor( @Inject private foodDataService: FoodEntityService) {
    //     super(foodDataService)

    //     this.detailDelegate = this.foodDataService.findByName;
    // }

    @httpGet()
    get(req: Request, res: Response) {
        res.send("works");
    }

    // @Get("other/:id")
    // other2(context: IFultonRouterContext) {
    //     context.body = "other2"
    // }
}