import { IsNumber } from "class-validator";
import { column, entity } from "../../src/entities";
import { idColumn, relatedTo } from '../../src/entities/entity-decorators';
import { Category } from './category';

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