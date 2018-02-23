import { DiContainer, DiKeys, Type, inject, injectable } from "../interfaces";

import { IFultonApp } from "../fulton-app";

/**
 * Fulton Service
 */
@injectable()
export abstract class Service {
    @inject(DiKeys.FultonApp)
    protected app: IFultonApp;
}
