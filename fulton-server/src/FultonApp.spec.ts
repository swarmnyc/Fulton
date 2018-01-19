import { Factory, FultonApp, FultonAppOptions, FultonDiContainer, FultonService, inject, injectable } from "./index";

@injectable()
class ServiceA extends FultonService {
    value = "a"
}

@injectable()
class ServiceB extends FultonService {
    constructor(public serviceA: ServiceA) {
        super();
    }

    value = "b"
}

@injectable()
class ServiceC extends ServiceB {
    constructor(public serviceA: ServiceA) {
        super(serviceA);
    }

    value = "c"
}

@injectable()
class ServiceD extends ServiceB {
    constructor(public serviceA: ServiceA) {
        super(serviceA);
    }

    value = "d"
}

@injectable()
class ServiceE {
    constructor(public serviceA: ServiceA, public value) {

    }
}

@injectable()
class ApiService {
    constructor( @inject("api_key") public apiKey: string) {

    }
}

class MyFultonApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void | Promise<void> {
        options.providers = [
            { provide: "api_key", useValue: "abcd" }
        ];

        options.services = [
            ApiService,
            ServiceA,
            ServiceB,
            { provide: ServiceC, useClass: ServiceD },
            { provide: "ServiceC2", useClass: ServiceD, useSingleton: true },
            {
                provide: "ServiceC3",
                useFunction: (container) => {
                    //return container.get(ServiceD)
                    return new ServiceE(new ServiceB(null), "e");
                }
            },
            {
                provide: "ServiceC4",
                useSingleton: true,
                useFunction: (container) => {
                    return new ServiceE(new ServiceB(null), "e");
                }
            },
            { provide: ServiceD, useValue: new ServiceE(new ServiceB(null), "e") },
            {
                provide: "Service",
                useFactory: (container: FultonDiContainer) => {
                    return (type: string) => {
                        if (type == "a") return container.get(ServiceA);
                        if (type == "b") return container.get(ServiceB);
                        if (type == "c") return container.get(ServiceC);
                        if (type == "d") return container.get(ServiceD);
                    };
                }
            }
        ];
    }

}

describe('Fulton App', () => {
    let app: FultonApp;

    beforeEach(() => {
        app = new MyFultonApp();
        return app.init();
    })

    it('should register class by self with transient', async () => {

        let instance = app.container.get(ServiceB);

        expect(instance).toBeTruthy();
        expect(instance.value).toEqual("b");
        expect(instance.serviceA.value).toEqual("a");

        expect(instance != app.container.get(ServiceB)).toBeTruthy();
    });

    it('should register class by type with transient', async () => {

        let instance = app.container.get(ServiceC);

        expect(instance).toBeTruthy();
        expect(instance.value).toEqual("d");
        expect(instance.serviceA.value).toEqual("a");

        expect(instance != app.container.get(ServiceC)).toBeTruthy();
    });

    it('should register class by type with singleton', async () => {

        let instance = app.container.get<ServiceC>("ServiceC2");

        expect(instance).toBeTruthy();
        expect(instance.value).toEqual("d");
        expect(instance.serviceA.value).toEqual("a");

        let instance2 = app.container.get<ServiceC>("ServiceC2");
        expect(instance == instance2).toBeTruthy();
    });

    it('should register class by value with singleton', async () => {

        let instance = app.container.get(ServiceD);

        expect(instance).toBeTruthy();
        expect(instance.value).toEqual("e");
        expect(instance.serviceA.value).toEqual("b");

        expect(instance == app.container.get(ServiceD)).toBeTruthy();
    });

    it('should register class by factory', async () => {

        let factory = app.container.get<Factory<ServiceD>>("Service");
        let instance = factory("d");

        expect(instance).toBeTruthy();
        expect(instance.value).toEqual("e");
        expect(instance.serviceA.value).toEqual("b");
    });

    it('should register class by function with transient', async () => {

        let instance = app.container.get<ServiceC>("ServiceC3");

        expect(instance).toBeTruthy();
        expect(instance.value).toEqual("e");
        expect(instance.serviceA.value).toEqual("b");

        let instance2 = app.container.get<ServiceC>("ServiceC3");
        expect(instance != instance2).toBeTruthy();
    });

    it('should register class by function with singleton', async () => {

        let instance = app.container.get<ServiceC>("ServiceC4");

        expect(instance).toBeTruthy();
        expect(instance.value).toEqual("e");
        expect(instance.serviceA.value).toEqual("b");

        let instance2 = app.container.get<ServiceC>("ServiceC4");
        expect(instance == instance2).toBeTruthy();
    });

    it('should register class with provider', async () => {

        let instance = app.container.get(ApiService);

        expect(instance).toBeTruthy();
        expect(instance.apiKey).toEqual("abcd");
    });
});