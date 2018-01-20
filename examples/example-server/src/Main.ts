import { ExampleApp } from "./example-app";

let app = new ExampleApp();

app.start().catch(() => {
    process.exit(1);
});
