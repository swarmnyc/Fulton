import { FoodDataSet } from "./datasets/FoodDataSet";

process.env.DbConnection = "mongodb://localhost:27017/fulton-example"

var foodDs = new FoodDataSet();

var food = foodDs.create({
    name: "test",
    category: "abc"
}).then((food) => {
    return foodDs.find()
}).then((foods) => {
    console.log(JSON.stringify(foods));
    process.exit();
}).catch((err) => {
    console.error(err);
    process.exit(1);
});