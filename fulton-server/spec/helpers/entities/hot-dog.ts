import { Entity, ObjectIdColumn, Column } from "typeorm";
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
    author: Author | string;
}
