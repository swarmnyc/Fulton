import { FultonDiContainer, Inject, Injectable } from "../interfaces";

import { FultonApp } from "../fulton-app";
import { Type } from "../helpers/type-helpers";

/**
 * Fulton Service
 */
@Injectable()
export abstract class FultonService {
    @Inject(FultonApp)
    protected app: FultonApp;

}
