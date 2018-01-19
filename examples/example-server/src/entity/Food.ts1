import { IFood, IIngredient } from "example-core";
import { Entity, ObjectIdColumn, Column, MongoRepository, Repository } from "typeorm";

import { Injectable } from "tsioc";
import { Ingredient } from "./Ingredient";

// will try other orm
@Entity()
export class Food implements IFood {
    @ObjectIdColumn()
    id?: string;
    @Column()
    name?: String;
    @Column()
    category?: String;
    @Column(type => Ingredient)
    ingredients?: Ingredient[];
}

export class FoodRepository extends MongoRepository<Food>{ }

