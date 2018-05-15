import { Column, Entity, ManyToMany, ManyToOne, ObjectIdColumn, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

export * from "../main"

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
