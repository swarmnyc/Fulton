import { IsDefined, IsEmail, IsInt, Max, Min, ValidateNested } from "class-validator";
import { idColumn } from '../../src/entities/entity-decorators';
import { column, entity } from "../../src/entities";
import { Territory } from './territory';

@entity("customers")
export class Customer {
    @idColumn()
    customerId: string;

    @IsDefined()
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

    @ValidateNested() // children must have this
    @column(type => Territory) // embedded documents
    territories: Territory[]
}