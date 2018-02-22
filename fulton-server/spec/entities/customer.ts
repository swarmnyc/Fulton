import { entity, objectIdColumn, column } from "../../src/interfaces";
import { Territory } from './territory';
import { IsInt, Min, Max, IsEmail, IsNotEmpty } from "class-validator";

@entity("customers")
export class Customer {
    @objectIdColumn({ type: String })
    customerId: string;

    @IsNotEmpty()
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

    @IsInt()
    @Min(0)
    @Max(10)
    @column()
    rating: number;

    @IsEmail()
    @column()
    email: string;

    @column(type => Territory) // embedded documents
    territories: Territory[]
}