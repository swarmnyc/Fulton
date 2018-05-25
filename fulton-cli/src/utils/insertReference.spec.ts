import { readFileSync } from "fs";
import { join } from "path";

describe('Insert Reference', () => {
    it('should insert import and reference', () => {
        var insertReference = require("./insertReference");

        var fileName = "test-router.ts"
        var filePath = join(".", "spec", "support", "src", "routers", fileName)
        var result: string = insertReference("TestRouter", fileName, filePath, "routers", "./spec/support/src", "app.ts", false)
        var target = readFileSync("./spec/support/result/app.ts").toString();
        expect(result).toEqual(target);
    });
});