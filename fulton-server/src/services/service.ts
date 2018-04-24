import { DiContainer, inject, injectable, Type } from '../interfaces';
import { DiKeys } from '../keys';
import { IFultonApp } from '../fulton-app';

/**
 * Fulton Service
 */
@injectable()
export abstract class Service {
    @inject(DiKeys.FultonApp)
    protected app: IFultonApp;
}
