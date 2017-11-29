import FoodRouter from "./routers/FoodRouter"
import { Container, ContainerBuilder } from "tsioc"

process.env.DbConnection = "mongodb://localhost:27017/fulton-example"

let builder = new ContainerBuilder();
let container = builder.create();

container.register(FoodRouter);
var fr = container.get(FoodRouter);

fr.test().then((foods) => {
    console.log(JSON.stringify(foods));
    process.exit();
}).catch((err) => {
    console.error(err);
    process.exit(1);
});