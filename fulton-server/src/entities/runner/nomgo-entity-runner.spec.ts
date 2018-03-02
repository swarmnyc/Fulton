import { MongoRepository } from "typeorm";
import { MongoEntityRunner } from "./mongo-entity-runner";

describe('Fulton entity service', () => {
    it('should transform includes', async () => {
        let runner = new MongoEntityRunner();

        let result = runner["transformIncludes"](["author", "author.tag", "author.tag.test", "tag"]);

        expect(result).toEqual({
            author: {
                tag: {
                    test: false
                }
            },
            tag: false
        });


        result = runner["transformIncludes"](["author.tag.test", "tag"]);

        expect(result).toEqual({
            author: {
                tag: {
                    test: false
                }
            },
            tag: false
        })
    });
});