import { IFultonUser } from '../interfaces';
import { Entity, ObjectIdColumn, Column, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity("users")
export class FultonUser implements IFultonUser {
    @PrimaryColumn()
    id: any;

    @Column({ length: 256 })
    username: string; // only for display

    @Column({ length: 256 })
    email: string; // only for notification

    @Column()
    portraitUrl: string;

    @Column()
    roles: string[];

    @Column()
    registeredAt: Date;

    @Column()
    status: string;
}

@Entity("users_identities")
export class FultonIdentity {
    @PrimaryColumn()
    id?: any;

    @Column()    
    userId: any;

    @Column()    
    type: string;

    // for type is local
    @Column({ length: 256 })
    email?: string;
    @Column({ length: 256 })
    username?: string;
    @Column({ length: 256 })
    hashedPassword?: string;
    @Column()
    resetPasswordToken?: string;
    @Column()
    resetPasswordCode?: string;
    @Column()
    resetPasswordExpiredAt?: Date;

    // for type is oauth, only keep last tokens
    @Column()    
    sourceUserId?: string;
    @Column()    
    accessToken?: string;
    @Column()    
    refreshToken?: string;
    @Column()    
    issuedAt?: Date;
    @Column()    
    expiredAt?: Date;
}

@Entity("user_access_tokens")
export class FultonAccessToken {
    @PrimaryColumn()
    id?: any;

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