import { FultonMongoEntityService } from "./fulton-mongo-entity-service";
import { MongoRepository } from "typeorm";

describe('Fulton entity service', () => {
    it('should transform includes', async () => {
        let service = new FultonMongoEntityService(new MongoRepository());

        let result = service["transformIncludes"](["author", "author.tag", "author.tag.test", "tag"]);

        expect(result).toEqual({
            author: {
                tag: {
                    test: false
                }
            },
            tag: false
        });


        result = service["transformIncludes"](["author.tag.test", "tag"]);

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