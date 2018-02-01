import { Entity, ObjectIdColumn, Column } from "typeorm";
import { Tag } from "./tag";

@Entity("authors")
export class Author {
    @ObjectIdColumn()
    hotdogId: string;

    @Column()
    name: string;

    @Column({ select: false })
    imageUrl: string;

    @Column()
    tags: Tag[];
}
