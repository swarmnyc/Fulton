import { entity, objectIdColumn, column } from "../../../src/interfaces";

@entity("tags")
export class Tag {
    @objectIdColumn()
    id: string;

    @column()
    name: string;

    @column()
    type: string;
}
