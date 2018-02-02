import { FultonEntityRouter, FultonRouter, Middleware, Request, Response, injectable, HttpGet, Router, inject, authorize, authorizeByRole } from "fulton-server"

@Router("/food", authorize(), authorizeByRole("admin"))
export class FoodRouter extends FultonRouter {
    // constructor(private foodDataService: FoodEntityService) {
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