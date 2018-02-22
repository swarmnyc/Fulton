import { entity, objectIdColumn, column } from "../../src/interfaces";
import { Category } from './category';
import { relatedTo } from '../../src/entities/related-decorators';
import { IsNumber } from "class-validator";

@entity("territories")
export class Territory {
    @objectIdColumn({ type: "number" }) // if the type isn't ObjectId, you needs give the type
    territoryId: number;

    @column()
    territoryDescription: string;

    @IsNumber()
    @column()
    regionId: number;

    @relatedTo(Category)
    categories: Category[];
}