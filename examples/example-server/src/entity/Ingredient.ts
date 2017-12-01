import { IIngredient } from "example-core";
import { Entity, ObjectIdColumn, Column, MongoRepository } from "typeorm";


// will try other orm
@Entity("ingredients")
export class Ingredient implements IIngredient {
    @ObjectIdColumn()
    id?: string;
    @Column()
    name: String;
    @Column()
    category: String;
}

export class IngredientRepository extends MongoRepository<Ingredient>{ }