import { DiContainer, DiKeys, inject, injectable } from './interfaces';
import { Env, Factory } from './helpers';
import { Router, router } from './routers';

import { EntityService } from './entities';
import { FultonApp } from './fulton-app';
import { FultonAppOptions } from './fulton-app-options';
import { FultonLog } from './fulton-log';
import { Service } from './services/service';

@injectable()
class ServiceA extends Service {
    value = "a"
}

@injectable()
class ServiceB extends Service {
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
    constructor(public serviceA: ServiceA, public value: any) {

    }
}

@injectable()
class ApiService {
    constructor(@inject("api_key") public apiKey: string) {

    }
}

@router("/A")
class RouterA extends Router {
    constructor(public serviceA: ServiceA) {
        super();
    }
}

@router("/B")
class RouterB extends Router {
    constructor(public serviceB: ServiceB) {
        super();
    }
}

class MyFultonApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void | Promise<void> {
        options.settings.zoneEnabled = false;

        options.providers = [
            { provide: "api_key", useValue: "abcd" },
            { provide: DiKeys.EntityServiceFactory, useValue: "abcd" }
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
                useFactory: (container: DiContainer) => {
                    return (type: string) => {
                        if (type == "a") return container.get(ServiceA);
                        if (type == "b") return container.get(ServiceB);
                        if (type == "c") return container.get(ServiceC);
                        if (type == "d") return container.get(ServiceD);
                    };
                }
            }
        ];

        options.routers = [
            RouterA,
            RouterB
        ];
    }

    protected initDatabases(): Promise<void> {
        return;
    }

    routers: Router[];
    protected didInitRouters(routers: Router[]) {
        this.routers = routers;
    }
}

describe('Fulton App', () => {
    let app: MyFultonApp;

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

    it('should create routers', async () => {
        expect(app.routers.length).toEqual(2);
        expect(app.routers[0]["app"]).toBeTruthy();
        expect(app.routers[0]["metadata"].router.path).toEqual("/A");
        expect((app.routers[1] as RouterB).serviceB.value).toEqual("b");
    });

    it('should override EntityServiceFactory', async () => {
        expect(app.container.get(DiKeys.EntityServiceFactory)).toEqual("abcd");
    });
});

describe('Fulton Start will https', () => {
    beforeAll(() => {
        FultonLog.configure({
            level: "error",
            transports: []
        })
    })

    afterAll(() => {
        FultonLog.configure({
            console: {
                colorize: true,
                level: "info"
            }
        });
    })

    it('should start https with localhost.crt', async () => {
        let app = new MyFultonApp()
        
        Env.isProduction = false
        app.options.server.httpsEnabled = true

        await app.start().catch(fail)
        await app.stop()
    });

    it('should fail to start https with localhost.crt', async () => {
        let app = new MyFultonApp()

        app.options.server.httpsEnabled = true
        Env.isProduction = true

        await app.start().then(fail).catch(() => { })
        await app.stop()
        Env.isProduction = false
    });
});