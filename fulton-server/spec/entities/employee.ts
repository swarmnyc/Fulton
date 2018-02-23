import { column, entity, objectIdColumn } from "../../src/interfaces";

import { Territory } from './territory';
import { relatedTo, idColumn } from '../../src/entities/entity-decorators';

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