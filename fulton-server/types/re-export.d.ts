import { Column, Entity, ManyToMany, ManyToOne, ObjectIdColumn, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

// this file if typescript supports, because I want to make typeorm package is optional

declare module "../src/re-export" {
    export const column: typeof Column;
    export const entity: typeof Entity;
    export const manyToMany: typeof ManyToMany;
    export const manyToOne: typeof ManyToOne;
    export const objectIdColumn: typeof ObjectIdColumn;
    export const oneToMany: typeof OneToMany;
    export const oneToOne: typeof OneToOne;
    export const primaryColumn: typeof PrimaryColumn;
    export const primaryGeneratedColumn: typeof PrimaryGeneratedColumn;
    
    export { ObjectId } from 'bson';
}

