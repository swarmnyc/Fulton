import { IFultonUser, FultonAccessToken, FultonUserOauth } from "../interfaces"
import { Entity, ObjectIdColumn, Column } from "typeorm";

@Entity("users")
export class FultonUser implements IFultonUser {
    @ObjectIdColumn()
    id?: string;
    @Column()
    email?: string;
    @Column()
    username?: string;
    @Column()
    hashedPassword?: string;
    @Column()
    accessTokens: FultonAccessToken[];
    @Column()
    oauth: FultonUserOauth[];
    @Column()
    roles: string[];
}