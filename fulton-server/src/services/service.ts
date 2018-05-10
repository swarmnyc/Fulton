import { DiKeys } from '../keys';
import { IFultonApp } from '../fulton-app';
import { inject, injectable } from '../interfaces';
import { IUser } from '../identity/interfaces';

/**
 * Fulton Service
 */
@injectable()
export abstract class Service {
    @inject(DiKeys.FultonApp)
    protected app: IFultonApp;

    onInit(): void {
    }

    get currentUser(): IUser {
        if (this.app && this.app.userService) {
            return this.app.userService.currentUser
        }
    }
}
