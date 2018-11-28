import { sleep } from "../../../spec/helpers/test-helper";
import { FultonApp } from "../../fulton-app";
import { ICacheProvideService } from "../../interfaces";
import { DiKeys } from "../../keys";
import { FultonAppOptions } from "../../options/fulton-app-options";

class MyApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void | Promise<void> {
        options.cache.enabled = true
    }
}

describe('Memory cache service', () => {
    let app: MyApp

    beforeAll(() => {
        app = new MyApp()
        app.init()
    })

    it('should get set data', async () => {
        let service = app.getCacheService("test")
        service.set("test1", "ABCD", 50)

        expect(await service.get("test1")).toEqual("ABCD")
        expect(await service.get("test1")).toEqual("ABCD")

        await sleep(60)

        // expired
        expect(await service.get("test1")).toBeUndefined()
    });

    it('should remove data', async () => {
        let service = app.getCacheService("test")
        service.set("test", "ABCD", 1000)
        expect(await service.get("test")).toEqual("ABCD")
        service.delete("test")
        expect(await service.get("test")).toBeUndefined()
    });

    it('should isolate data', async () => {
        let service1 = app.getCacheService("test-1")
        let service2 = app.getCacheService("test-2")
        service1.set("test", "ABCD")
        service2.set("test", "EFG")

        expect(await service1.get("test")).toEqual("ABCD")
        expect(await service2.get("test")).toEqual("EFG")
    });

    it('should re-use service', async () => {
        let service = app.getCacheService("test")

        service.set("ABC", "EFG")

        expect(await service.get("ABC")).toEqual("EFG")

        service = app.getCacheService("test")

        expect(await service.get("ABC")).toEqual("EFG")
    });

    it('should reset data', async () => {
        let service = app.getCacheService("test")
        service.set("test1", "ABCD", 1000)
        service.set("test2", "ABCD", 1000)

        await service.reset()

        expect(await service.get("test1")).toBeUndefined()
        expect(await service.get("test2")).toBeUndefined()
    });


    it('should reset all', async () => {
        let service1 = app.getCacheService("test-1")
        let service2 = app.getCacheService("test-2")
        service1.set("test", "ABCD")
        service2.set("test", "ABCD")

        let provider = app.getInstance<ICacheProvideService>(DiKeys.CacheProviderService)
        provider.resetAll()

        expect(await service1.get("test")).toBeUndefined()
        expect(await service2.get("test")).toBeUndefined()
    });
});