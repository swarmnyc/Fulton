export interface Options {
    init?(): void
}

export abstract class BaseOptions<T extends Options> implements Options {
    constructor(protected appName?: string, protected appMode?: string) {}

    init?(): void {}

    set?(options: T): void {
        Object.assign(this, options);
    }
}