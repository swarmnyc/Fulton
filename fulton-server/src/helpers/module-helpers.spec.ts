import * as moduleA from "../../spec/helpers/modules/module-a"
import * as moduleB from "../../spec/helpers/modules/module-b"
import * as moduleC from "../../spec/helpers/modules/sub-modules/module-c"
import * as moduleD from "../../spec/helpers/modules/sub-modules/sub-modules/module-d"

import { RouterA, ServiceA } from "../../spec/helpers/classes/classes1/classes-a";
import { RouterB, RouterC } from "../../spec/helpers/classes/classes1/classes-b";
import RouterD, { ServiceB } from "../../spec/helpers/classes/classes2/classes-d";
import { defaultClassLoader, loadModules, moduleExists } from './module-helpers';

import { Router } from '../routers/router';
import RouterE from "../../spec/helpers/classes/classes2/classes3/classes-e";
import { Service } from '../services/service';

describe("module helper", () => {
    it("should load moudule not recurrively", async () => {
        let modules = await loadModules("spec/helpers/modules", false);
        expect(modules.length).toEqual(2);
        expect(modules).toContain(moduleA);
        expect(modules).toContain(moduleB);
    });

    it("should load moudule recurrively", async () => {
        let modules = await loadModules("spec/helpers/modules", true);
        expect(modules.length).toEqual(4);
        expect(modules).toContain(moduleA);
        expect(modules).toContain(moduleB);
        expect(modules).toContain(moduleC);
        expect(modules).toContain(moduleD);
    });

    it("should load router classes", async () => {
        let routers = await defaultClassLoader(Router)(["spec/helpers/classes/classes1", "spec/helpers/classes/classes2"]);
        expect(routers.length).toEqual(5);
        expect(routers).toContain(RouterA);
        expect(routers).toContain(RouterB);
        expect(routers).toContain(RouterC);
        expect(routers).toContain(RouterD);
        expect(routers).toContain(RouterE);
    });

    it("should load service classes", async () => {
        let services = await defaultClassLoader(Service)(["spec/helpers/classes/"]);
        expect(services.length).toEqual(2);
        expect(services).toContain(ServiceA);
        expect(services).toContain(ServiceB);
    });

    it("should check moduels", async () => {
        expect(moduleExists("express")).toEqual(true);
        expect(moduleExists("facebook")).toEqual(false);
    });
});