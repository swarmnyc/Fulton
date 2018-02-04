import { Tag } from "./tag";
import { entity, objectIdColumn, column, manyToMany } from "../../../src/interfaces";
import { relatedTo } from "../../../src/index";

@entity("authors")
export class Author {
    @objectIdColumn()
    id: string;

    @column()
    name: string;

    @column({ select: false })
    imageUrl: string;

    @relatedTo(Tag)
    tags: Tag[];
}
