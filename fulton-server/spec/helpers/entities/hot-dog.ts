import { Entity, ObjectIdColumn, Column, OneToMany, OneToOne, ManyToOne } from "typeorm";
import { Author } from "./author";

@Entity("hotdogs")
export class Hotdog {
    @ObjectIdColumn()
    hotdogId: string;

    @Column()
    name: string;

    @Column({ select: false })
    location: number[];

    @Column()
    address: string;

    @Column()
    review: string;

    @Column({ select: false })
    picture: string;

    @Column()
    authorId: string;

    @ManyToOne(type => Author, key => "authorId")
    author: Author;
}