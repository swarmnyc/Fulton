import { entity, objectIdColumn, column } from "../../src/index";

@entity("customers")
export class Customer {
    @objectIdColumn()
    customerId: string;

    @column()
    companyName:string;

    @column()
    contactName:string;

    @column()
    contactTitle:string;

    @column()
    address:string;

    @column()
    city:string;

    @column()
    region:string;

    @column()
    postalCode:number;

    @column()
    country:string;

    @column()
    phone:string;

    @column()
    fax:string;
}