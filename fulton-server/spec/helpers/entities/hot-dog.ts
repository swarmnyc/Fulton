import { Entity, ObjectIdColumn, Column } from "typeorm";

@Entity("hotdogs")
export class Hotdog  {
    @ObjectIdColumn()
    id: string;

    @Column()
    name: string;

    @Column()
    location: number[];

    @Column()
    address: string;

    @Column()
    review: string;

    @Column()
    picture: string;

    @Column()
    author: string;
}
