import { join } from "path";
import { GenerateFileOptions } from "../interfaces";
import { GenerateFileAction } from "./generate-file-action";

describe('generate file action', () => {
    it('should generate options', () => {
        let action = new GenerateFileAction({
            schematic: "entity",
            name: "News"
        } as GenerateFileOptions)

        let options = action["options"]

        expect(options.className).toEqual("News");
        expect(options.fileName).toEqual("news.ts");
        expect(options.filePath).toEqual(join("router"));
    });
});