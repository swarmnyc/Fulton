import { Type, TypeIdentifier } from '../interfaces';
import { DiContainer } from '../alias';
import { isFunction } from "util";

export interface TypeProvider extends Type {
}

export interface ClassProvider {
    provide: TypeIdentifier;
    useClass: Type;

    /**
     * use Singleton pattern if true, default is false;
     */
    useSingleton?: boolean;
}

export interface ValueProvider {
    provide: TypeIdentifier;
    useValue: any;
}

export type Factory<T=any> = (...args: any[]) => T;
export interface FactoryProvider {
    provide: TypeIdentifier;
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
    useFactory: (container: DiContainer) => Factory;
}

export interface FunctionProvider {
    provide: TypeIdentifier;
    useFunction: (container: DiContainer) => any;

    /**
     * use Singleton pattern if true, default is false;
     */
    useSingleton?: boolean;
}

export declare type Provider = TypeProvider | ValueProvider | ClassProvider | FactoryProvider | FunctionProvider;

export function getIdentifiers(providers: Provider[]): TypeIdentifier[] {
    let ids: TypeIdentifier[] = [];
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