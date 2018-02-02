import { EntityRouter, Router, Middleware, Request, Response, injectable, httpGet, router, inject, authorize, authorizeByRole } from "fulton-server"

@router("/food", authorize(), authorizeByRole("admin"))
export class FoodRouter extends Router {
    // constructor(private foodDataService: FoodEntityService) {
    //     super(foodDataService)

    //     this.detailDelegate = this.foodDataService.findByName;
    // }

    @httpGet()
    get(req: Request, res: Response) {
        res.send("works");
    }

    // @Get("other/:id")
    // other2(context: IRouterContext) {
    //     context.body = "other2"
    // }
}