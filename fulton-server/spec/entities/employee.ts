import { entity, objectIdColumn, column, relatedTo } from "../../src/index";
import { Territory } from './territory';

@entity("employees")
export class Employee {
    @objectIdColumn({ type: Number }) // if the type isn't ObjectId, you needs give the type
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