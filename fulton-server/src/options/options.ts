export interface Options {
    init?(appName: string): void
}

export abstract class BaseOptions<T extends Options> implements Options {
    init?(appName: string): void{        
    }

    options?(options: T): void {
        Object.assign(this, options);
    }
}