import { Author } from "./author";
import { entity, column, objectIdColumn, manyToOne } from "../../../src/interfaces";

@entity("hotdogs")
export class Hotdog {
    @objectIdColumn()
    hotdogId: string;

    @column()
    name: string;

    @column({ select: false })
    location: number[];

    @column()
    address: string;

    @column()
    review: string;

    @column({ select: false })
    picture: string;

    @column()
    authorId: string;

    @manyToOne(type => Author, key => "authorId")
    author: Author;
}
