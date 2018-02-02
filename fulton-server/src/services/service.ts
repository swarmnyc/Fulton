import { DiContainer, inject, injectable } from "../interfaces";

import { FultonApp } from "../fulton-app";
import { Type } from "../helpers/type-helpers";

/**
 * Fulton Service
 */
@injectable()
export abstract class Service {
    @inject(FultonApp)
    protected app: FultonApp;

}
