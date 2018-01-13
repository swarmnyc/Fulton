export interface Type<T = any> extends Function {
    new(...args: any[]): T;
}

export interface TypeProvider extends Type {
}

export interface ClassProvider {
    provide: any;
    useClass: Type;
}

export interface ValueProvider {
    provide: any;
    useValue: any;
}

export interface FactoryProvider {
    provide: any;
    useFactory: Function;
    deps?: any[];
}

export declare type Provider = TypeProvider | ValueProvider | ClassProvider | FactoryProvider;