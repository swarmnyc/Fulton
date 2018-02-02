import { FultonDiContainer } from "../index";
import { isFunction } from "util";

export type TypeIdentifier<T = any> = (string | symbol | Type<T>);

export interface AbstractType<T> extends Function {
}

export interface Type<T = any> extends Function {
    new(...args: any[]): T;
}

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
    useFactory: (container: FultonDiContainer) => Factory;
}

export interface FunctionProvider {
    provide: TypeIdentifier;
    useFunction: (container: FultonDiContainer) => any;

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