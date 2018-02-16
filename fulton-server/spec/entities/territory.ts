import { entity, objectIdColumn, column } from "../../src/index";
import { Category } from './category';
import { relatedTo } from '../../src/entities/related-decorators';

@entity("territories")
export class Territory {
    @objectIdColumn({ type: "number" }) // if the type isn't ObjectId, you needs give the type
    territoryId: number;

    @column()
    territoryDescription: string;

    @column()
    regionId: number;

    @relatedTo(Category)
    categories: Category[];
}