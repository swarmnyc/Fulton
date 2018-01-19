import { FultonDiContainer, PathIdentifier, injectable } from "../interfaces";
import { RouterMetadata, getRouterMetadata } from "./route-decorators-helpers";

import { FultonApp } from "../index";
import { Identifier } from "../helpers/type-helpers";

@injectable()
export abstract class FultonRouter {
    private metadata: RouterMetadata

    path: PathIdentifier;
    app: FultonApp;

    constructor() {
        this.loadMetadata();
    }

    init() {
        this.onInit();
    }

    loadMetadata(){
        this.metadata = getRouterMetadata(this.constructor);
        if (this.metadata) {
            this.path = this.metadata.path;
        }
    }

    protected onInit() {

    }
}
