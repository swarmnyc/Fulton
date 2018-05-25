import { FultonApp, FultonAppOptions } from "fulton-server"
import { Article } from "./entities/article"
import { Author } from "./entities/author"
import { ArticleRouter } from "./routers/article-router"
import { AuthorRouter } from "./routers/author-router"
import { SampleRouter } from "./routers/sample-router"
import { SampleService } from "./services/sample-service"
import { TestRouter } from "./routers/test-router.ts";

export class SampleApp extends FultonApp {
    /**
    Initializing app, like enable features and set options. Some options can be defined on .env file.
    */
    protected onInit(options: FultonAppOptions): void | Promise<void> {
        // Fulton use inversify (http://inversify.io/) for dependency injection. In order to do that, classes have to be registered.

        // register entities
        options.entities = [
            Article,
            Author
        ];

        // register routers
        options.routers = [
            SampleRouter,
            ArticleRouter,
            AuthorRouter,
            TestRouter
        ];

        // register services
        options.services = [
            SampleService
        ]
    }
}