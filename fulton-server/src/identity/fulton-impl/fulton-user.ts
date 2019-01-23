import { Column, Entity, PrimaryColumn } from 'typeorm';
import { IFultonUserClaims, IFultonUser } from '../types';

@Entity("users")
export class FultonUser implements IFultonUser {
	@PrimaryColumn()
	id: any;

	@Column({ length: 256 })
	displayName: string;

	@Column({ length: 256 })
	email: string;

	@Column()
	portraitUrl: string;

	@Column()
	roles: string[];

	@Column()
	isDeleted: boolean;

	@Column()
	registeredAt: Date;

	@Column()
	updatedAt: Date;
}

@Entity("users_claims")
export class FultonUserClaims implements IFultonUserClaims {
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

	// for login fail
	@Column()
	loginTryCount?: number
	@Column()
	loginFailedAt?: Date
	@Column()
	loginLockReleaseAt?: Date

	// for reset password
	@Column()
	resetPasswordToken?: string;
	@Column()
	resetPasswordCode?: string;
	@Column()
	resetPasswordExpiredAt?: Date;
	@Column()
	resetPasswordCodeTryCount?: number;

	@Column()
	resetPasswordLastRequiredAt?: Date;
	@Column()
	resetPasswordRequireLockReleaseAt?: Date;
	@Column()
	resetPasswordRequireCount?: number;

	// for type is oauth, only keep last tokens
	@Column({ length: 256 })
	displayName?: string;
	@Column()
	sourceId?: string;
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
export class FultonUserAccessToken {
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
