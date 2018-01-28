import { IFultonUser, FultonAccessToken, FultonUserOauth } from "../interfaces"
import { Entity, ObjectIdColumn, Column } from "typeorm";

@Entity("users")
export class FultonUser implements IFultonUser {
    @ObjectIdColumn()
    id: string;

    @Column({ unique: true, nullable: false, length: 256 })
    email: string;

    @Column({ unique: true, nullable: false, length: 256 })
    username: string;

    @Column({ length: 256 })
    hashedPassword: string;

    @Column({ length: 256 })
    displayName: string;

    @Column()
    portraitUrl: string;

    @Column({})
    accessTokens: FultonAccessToken[];

    @Column({})
    oauthes: FultonUserOauth[];

    @Column({})
    roles: string[];

    @Column()
    resetPasswordCode: string;

    @Column()
    resetPasswordCodeExpiredAt: Date;
}