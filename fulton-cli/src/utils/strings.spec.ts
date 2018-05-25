import { classify, normalizeFilename } from "./strings";

describe('String Utility', () => {
    it('should classify strings', () => {
        expect(classify("my-router")).toEqual("MyRouter");
        expect(classify("myRouter")).toEqual("MyRouter");
        expect(classify("my_router")).toEqual("MyRouter");
        expect(classify("my Router")).toEqual("MyRouter");
        expect(classify("my")).toEqual("My");
    });

    it('should normalizeFilename strings', () => {
        expect(normalizeFilename("my-router")).toEqual(["my-router"]);
        expect(normalizeFilename("my_router")).toEqual(["my-router"]);
        expect(normalizeFilename("MyRouter")).toEqual(["my-router"]);

        expect(normalizeFilename("folder/my-router")).toEqual(["folder", "my-router"]);
        expect(normalizeFilename("MyFolder/MyRouter")).toEqual(["MyFolder", "my-router"]);
    });
});