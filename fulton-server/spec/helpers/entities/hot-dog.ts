import { Entity, ObjectIdColumn, Column } from "typeorm";

@Entity("hotdogs")
export class Hotdog {
    @ObjectIdColumn()
    id: string;

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
    author: string;
}
