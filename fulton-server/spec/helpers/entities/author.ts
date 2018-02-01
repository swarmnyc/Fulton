import { Entity, ObjectIdColumn, Column, ManyToMany } from "typeorm";
import { Tag } from "./tag";

@Entity("authors")
export class Author {
    @ObjectIdColumn()
    id: string;

    @Column()
    name: string;

    @Column({ select: false })
    imageUrl: string;

    @Column()
    tagIds: string[];

    @ManyToMany(type => Tag, keys => "tagIds")
    tags: Tag[];
}
