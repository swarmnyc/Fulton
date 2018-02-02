import { Tag } from "./tag";
import { entity, objectIdColumn, column, manyToMany } from "../../../src/interfaces";

@entity("authors")
export class Author {
    @objectIdColumn()
    id: string;

    @column()
    name: string;

    @column({ select: false })
    imageUrl: string;

    @column()
    tagIds: string[];

    @manyToMany(type => Tag, keys => "tagIds")
    tags: Tag[];
}
