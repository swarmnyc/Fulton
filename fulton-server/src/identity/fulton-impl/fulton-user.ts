import { IFultonUser } from '../interfaces';
import { Entity, ObjectIdColumn, Column, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity("users")
export class FultonUser implements IFultonUser {
    @PrimaryColumn()
    id: string;

    @Column({ unique: true, nullable: false, length: 256 })
    email: string;

    @Column({ unique: true, nullable: false, length: 256 })
    username: string;

    @Column({ length: 256, select: false })
    hashedPassword?: string;

    @Column({ length: 256 })
    displayName: string;

    @Column()
    portraitUrl: string;

    @Column({})
    roles: string[];

    @Column()
    resetPasswordCode?: string;

    @Column()
    resetPasswordCodeExpiredAt?: Date;
}


@Entity("user_access_tokens")
export class FultonAccessToken {
    @PrimaryColumn()
    id?: string;

    @Column()    
    token?: string;
    @Column()    
    issuedAt?: Date;
    @Column()    
    expiredAt?: Date;
    @Column()    
    revoked?: boolean;

    @Column()    
    userId?: string;
}

@Entity("user_oauth_tokens")
export class FultonOauthToken {
    @PrimaryColumn()
    id?: string;

    @Column()    
    provider?: string;
    @Column()    
    accessToken?: string;
    @Column()    
    refreshToken?: string;
    @Column()    
    issuedAt?: Date;
    @Column()    
    expiredAt?: Date;

    @Column()    
    userId?: string;
}