import { ExampleApp } from "./ExampleApp";

let app = new ExampleApp();

app.init().then(() => {
    app.express.use("/", (req, res) => {
        res.send("works");
    });

    app.start().then(() => {
        console.log("App Start");
    });
})