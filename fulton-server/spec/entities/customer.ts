import { entity, objectIdColumn, column } from "../../src/interfaces";

@entity("customers")
export class Customer {
    @objectIdColumn({ type: String })
    customerId: string;

    @column()
    companyName: string;

    @column()
    contactName: string;

    @column()
    contactTitle: string;

    @column()
    address: string;

    @column()
    city: string;

    @column()
    region: string;

    @column()
    postalCode: number;

    @column()
    country: string;

    @column()
    phone: string;

    @column()
    fax: string;
}