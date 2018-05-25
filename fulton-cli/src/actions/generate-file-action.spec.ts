import { GenerateFileAction } from "./generate-file-action";
import { GenerateFileOptions } from "../interfaces";
import { join } from "path";
import logger from "winston";

describe('generate file action', () => {
    it('should generate options', () => {
        let action = new GenerateFileAction({
            schematic: "entity",
            name: "News"
        } as any)
        
        let options = action["options"]

        expect(options.className).toEqual("News");
        expect(options.fileName).toEqual("news.ts");
        expect(options.filePath).toEqual(join("router"));
    });
});