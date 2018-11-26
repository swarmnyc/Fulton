import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity("client-securities")
export class ClientSecurity {
    @PrimaryColumn()
    id: any;

    @Column({ length: 256 })
    name: string;

    @Column({ length: 256 })
    key: string;

    @Column()
    secret: string;

    @Column()
    expiredAt: Date;

    @Column()
    createdAt: Date;

    @Column()
    updatedAt: Date;
}