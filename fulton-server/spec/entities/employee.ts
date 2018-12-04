import { column, entity } from "../../src/entities";
import { idColumn, relatedTo } from '../../src/entities/entity-decorators';
import { Territory } from './territory';

@entity("employees")
export class Employee {
    @idColumn() // if the type isn't ObjectId, use idColumn
    employeeId: number;

    @column()
    lastName: string;

    @column()
    firstName: string;

    @column()
    title: string;

    @column()
    titleOfCourtesy: string;

    @column()
    birthDate: Date;

    @column()
    hireDate: Date;

    @column({ select: false })
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
    homePhone: string;

    @column()
    extension: string;

    @column()
    photo: string;

    @column()
    notes: string;

    @column()
    reportsTo: number;

    @column()
    photoPath: string;

    // Mongo style relationship
    @relatedTo(Territory)
    territories: Territory[];
}