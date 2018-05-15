import { entity, objectIdColumn, column } from "../../src/re-export";
import { Category } from './category';
import { relatedTo, idColumn } from '../../src/entities/entity-decorators';
import { IsNumber } from "class-validator";

@entity("territories")
export class Territory {
    @idColumn() // if the type isn't ObjectId, use idColumn
    territoryId: number;

    @column()
    territoryDescription: string;

    @IsNumber()
    @column()
    regionId: number;

    @relatedTo(Category)
    categories: Category[];
}