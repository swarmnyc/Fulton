import { FultonEntityService, IFultonContext } from "fulton-server";
import { Injectable, Inject } from "tsioc";
import { Food, FoodRepository } from "../entity/Food";
import { IngredientRepository } from "../entity/Ingredient";

@Injectable
export class FoodEntityService extends FultonEntityService<Food> {
    constructor( @Inject public foodRepository: FoodRepository, @Inject public ingredientRepository: IngredientRepository) {
        super(foodRepository);
    }

    findByName(context: IFultonContext, name: String): Promise<Food> {
        return this.foodRepository.findOne({ where: { name: name } });
    }

    create(context: IFultonContext, obj: Food): Promise<Food> {
        // do some for ingredient like
        return this.foodRepository.insert(obj).then(() => {
            return this.ingredientRepository.insertMany(obj.ingredients).then(() => {
                return obj;
            });
        });
    }
}