import { ExampleApp } from "./ExampleApp";

let app = new ExampleApp();

app.start().catch(() => {
    process.exit(1);
});
