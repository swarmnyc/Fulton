// alias some names
import { Column, Entity, ManyToMany, ManyToOne, ObjectIdColumn, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

export const column = Column;
export const entity = Entity;
export const manyToMany = ManyToMany;
export const manyToOne = ManyToOne;
export const objectIdColumn = ObjectIdColumn;
export const oneToMany = OneToMany;
export const oneToOne = OneToOne;
export const primaryColumn = PrimaryColumn;
export const primaryGeneratedColumn = PrimaryGeneratedColumn;

export { ObjectId } from 'bson';

export * from "./entity-decorators";
export * from "./entity-service";
