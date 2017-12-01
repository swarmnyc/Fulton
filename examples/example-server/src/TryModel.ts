import "reflect-metadata";
import { createConnection, useContainer } from "typeorm";
import { ContainerBuilder, Inject } from "tsioc";
import { MongoRepository } from "typeorm/repository/MongoRepository";
import { FoodRepository, Food } from "./entity/Food";
import { IngredientRepository, Ingredient } from "./entity/Ingredient";
import { FoodEntityService } from "./services/FoodDataService";


createConnection({
    "type": "mongodb",
    "host": "localhost",
    "port": 27017,
    "database": "typeorm-test"
 })
    .then(async (conn) => {
        let container = new ContainerBuilder().create();

        container.registerSingleton(FoodRepository, conn.getMongoRepository(Food))
        container.registerSingleton(IngredientRepository, conn.getMongoRepository(Ingredient))


        container.register(FoodEntityService)

        await container.get(FoodEntityService).create(null, {
            name: "food",
            category: "food"
        });

        var f = await container.get(IngredientRepository).insert({
            name: "A",
            category: "B",
        });

        console.log(f);
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });