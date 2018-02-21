import { DiContainer, Type, inject, injectable } from "../interfaces";

import { FultonApp } from "../fulton-app";

/**
 * Fulton Service
 */
@injectable()
export abstract class Service {
    @inject("FultonApp")
    protected app: FultonApp;
}
