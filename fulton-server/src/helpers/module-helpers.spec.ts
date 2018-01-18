import { loadModules } from "./module-helpers";
import * as moduleA from "../../spec/helpers/modules/module-a"
import * as moduleB from "../../spec/helpers/modules/module-b"
import * as moduleC from "../../spec/helpers/modules/sub-modules/module-c"
import * as moduleD from "../../spec/helpers/modules/sub-modules/sub-modules/module-d"

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
});