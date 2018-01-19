import { FultonDiContainer } from "../index";
import { isFunction } from "util";

export type Identifier<T = any> = (string | symbol | Type<T>);

export interface Type<T = any> extends Function {
}

export interface TypeProvider extends Type {
}

export interface ClassProvider {
    provide: Identifier;
    useClass: Type;

    /**
     * use Singleton pattern if true, default is false;
     */
    useSingleton?: boolean;
}

export interface ValueProvider {
    provide: Identifier;
    useValue: any;
}

export type Factory<T=any> = (...args: any[]) => T;
export interface FactoryProvider {
    provide: Identifier;
    /**
     * @example
     * //register
     * options.service = [
     *  { provide: ServiceB, useFactory: (container) => {
     *      return (arg) => {
     *          // can use container to get instance
     *          return container.get(ServiceA) || new ServiceA()
     *      }
     *    }
     *  }
     * ]
     * 
     * //to get value
     * let factory = app.container.get<Factory<ServiceB>>(ServiceB);
     * let instance = factory("arg");
     */
    useFactory: (container: FultonDiContainer) => Factory;
}

export interface FunctionProvider {
    provide: Identifier;
    useFunction: (container: FultonDiContainer) => any;

    /**
     * use Singleton pattern if true, default is false;
     */
    useSingleton?: boolean;
}

export declare type Provider = TypeProvider | ValueProvider | ClassProvider | FactoryProvider | FunctionProvider;

export function getIdentifiers(providers: Provider[]): Identifier[] {
    let ids: Identifier[] = [];
    if (providers == null)
        return ids;

    for (const provider of providers as any[]) {
        if (isFunction(provider)) {
            ids.push(provider);
        } else if (provider.provide) {
            ids.push(provider.provide);
        }
    }

    return ids;
}