import { FultonDiContainer } from "../interfaces";
import { Type } from "../helpers/type-helpers";

// regular Router
export abstract class FultonService {
    namespace: string;

    container: FultonDiContainer;

    get<T>(type: Type<T>): T {
        let instance = this.container.get(type);
        // to do

        return instance
    }
}
