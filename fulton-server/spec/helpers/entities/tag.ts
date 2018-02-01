import { Entity, ObjectIdColumn, Column } from "typeorm";

@Entity("tags")
export class Tag {
    @ObjectIdColumn()
    id: string;

    @Column()
    name: string;

    @Column()
    type: string;
}
