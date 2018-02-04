import { Author } from "./author";
import { entity, column, objectIdColumn, manyToOne } from "../../../src/interfaces";
import { relatedTo } from "../../../src/index";

@entity("hotdogs")
export class Hotdog {
    @objectIdColumn()
    hotdogId: string;

    @column()
    name: string;

    @column()
    location: number[];

    @column()
    address: string;

    @column()
    review: string;

    @column({ select: false })
    picture: string;

    @relatedTo(Author)
    author: Author;
}
