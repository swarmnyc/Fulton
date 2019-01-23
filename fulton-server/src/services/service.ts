import { DiKeys } from '../keys';
import { IFultonApp } from '../fulton-app';
import { inject, injectable } from '../alias';
import { IUser } from '../identity/types';

/**
 * Fulton Service
 */
@injectable()
export abstract class Service {
    @inject(DiKeys.FultonApp)
    protected app: IFultonApp;

    onInit(): void {
    }

    getCurrentUser(): IUser {
        if (this.app && this.app.identityService) {
            return this.app.identityService.getCurrentUser()
        }
    }
}
