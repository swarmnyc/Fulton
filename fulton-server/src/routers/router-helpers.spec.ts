import { defaultRouterLoader } from "./router-helpers";
import { RouterA } from "../../spec/routers/router1/router-a";
import { RouterB, RouterC } from "../../spec/routers/router1/router-b";
import RouterD from "../../spec/routers/router2/router-d";
import RouterE from "../../spec/routers/router2/router3/router-e";

describe("router helper", () => {
    it("should load routers", async () => {
        let routers = await defaultRouterLoader(["spec/routers/router1", "spec/routers/router2"]);
        expect(routers.length).toEqual(5);
        expect(routers).toContain(RouterA);
        expect(routers).toContain(RouterB);
        expect(routers).toContain(RouterC);
        expect(routers).toContain(RouterD);
        expect(routers).toContain(RouterE);
    });
});