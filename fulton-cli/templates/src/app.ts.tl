import { FultonApp, FultonAppOptions } from "fulton-server"
<% if(isDatabaseEnabled) { %>import { ArticleEntity } from "./entities/article-entity"
import { AuthorEntity } from "./entities/author-entity"
import { ArticleRouter } from "./routers/article-router"
import { AuthorRouter } from "./routers/author-router"<% } %>
import { SampleRouter } from "./routers/sample-router"
import { SampleService } from "./services/sample-service"

export class ${appName} extends FultonApp {
    /**
    Initializing app, like enable features and set options. Some options can be defined on .env file.
    */
    protected onInit(options: FultonAppOptions): void | Promise<void> {
        // Fulton use inversify (http://inversify.io/) for dependency injection. In order to do that, classes have to be registered.

        <% if(isDatabaseEnabled) { %> // register entities
        options.entities = [
            ArticleEntity,
            AuthorEntity
        ];<% } %>

        // register routers
        options.routers = [
            SampleRouter,
            <% if(isDatabaseEnabled) { %>ArticleRouter,
            AuthorRouter<% } %>
        ];

        // register services
        options.services = [
            SampleService
        ]
    }
}