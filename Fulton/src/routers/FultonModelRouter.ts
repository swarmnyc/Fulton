import { FultonRouter } from "./FultonRouter";
import { IFultonDataSet } from "../cores/IFultonDataSet";


// has 5 pre-definied action based on model
export abstract class FultonModelRouter extends FultonRouter {
    constructor(dataset: IFultonDataSet) {
        super();
    }
}