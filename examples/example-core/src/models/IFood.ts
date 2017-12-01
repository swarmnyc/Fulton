import { IIngredient } from "./IIngredient";

export interface IFood {
    id?: string;
    name?: String;
    category?: String;
    ingredients?: IIngredient[];
}