import { Factory, FultonApp, FultonAppOptions, FultonDiContainer, FultonRouter, FultonService, inject, injectable, router } from "./index";

import { MongoConnectionOptions } from "typeorm/driver/mongodb/MongoConnectionOptions";

class MyFultonApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void | Promise<void> {
    }

    protected initDatabases() : Promise<void> {
        return;
    }

    protected initRepositories() : Promise<void> {
        return;
    }
}

describe('Fulton App Options', () => {
    it('should init options', async () => {
        let app = new MyFultonApp();

        process.env[`${app.appName}.options.index.enabled`] = "0"

        process.env[`${app.appName}.options.logging.defaultLevel`] = "info"
        process.env[`${app.appName}.options.logging.defaultLoggerColorized`] = "false"
        process.env[`${app.appName}.options.logging.httpLogEnabled`] = "1"

        process.env[`${app.appName}.options.server.httpEnabled`] = "0"
        process.env[`${app.appName}.options.server.httpsEnabled`] = "true"
        process.env[`${app.appName}.options.server.httpPort`] = "777"
        process.env[`${app.appName}.options.server.httpsPort`] = "999"

        await app.init(true);

        expect(app.options.index.enabled).toEqual(false);

        expect(app.options.logging.defaultLevel).toEqual("info");
        expect(app.options.logging.defaultLoggerColorized).toEqual(false);
        expect(app.options.logging.httpLogEnabled).toEqual(true);

        expect(app.options.server.httpEnabled).toEqual(false);
        expect(app.options.server.httpsEnabled).toEqual(true);
        expect(app.options.server.httpPort).toEqual(777);
        expect(app.options.server.httpsPort).toEqual(999);
    });

    it('should reset options or not', async () => {
        let app = new MyFultonApp();

        process.env[`${app.appName}.options.server.httpPort`] = "80"
        await app.init(true);
        app.options.server.httpPort = 888;
        await app.init(false);
        expect(app.options.server.httpPort).toEqual(888);
    });

    it('should load default database options', async () => {
        let options = new FultonAppOptions("test");

        process.env[`test.options.database.url`] = "http://test"
        process.env[`test.options.database.cache`] = "true"
        process.env[`test.options.database.authSource`] = "true."
        process.env[`test.options.database.port`] = "80"

        options.loadDatabaseOptions();

        let dbOptions = options.databases.get("default") as MongoConnectionOptions;
        expect(dbOptions).toBeTruthy();
        expect(dbOptions.url).toEqual("http://test");
        expect(dbOptions.cache).toEqual(true);
        expect(dbOptions.authSource).toEqual("true.");
        expect(dbOptions.port).toEqual(80);
    });

    it('should load databases options', async () => {
        let options = new FultonAppOptions("test");

        process.env[`test.options.databases[test].url`] = "http://test"
        process.env[`test.options.databases[test].cache`] = "true"
        process.env[`test.options.databases[test].authSource`] = "true."
        process.env[`test.options.databases[test].port`] = "80"

        options.loadDatabaseOptions();

        let dbOptions = options.databases.get("test") as MongoConnectionOptions;
        expect(dbOptions).toBeTruthy();
        expect(dbOptions.url).toEqual("http://test");
        expect(dbOptions.cache).toEqual(true);
        expect(dbOptions.authSource).toEqual("true.");
        expect(dbOptions.port).toEqual(80);

        process.env[`test.options.databases[test2].url`] = "http://test2"
        process.env[`test.options.databases[test2].cache`] = "true"
        process.env[`test.options.databases[test2].authSource`] = "true."
        process.env[`test.options.databases[test2].port`] = "80"

        options.loadDatabaseOptions();

        dbOptions = options.databases.get("test2") as MongoConnectionOptions;
        expect(dbOptions).toBeTruthy();
        expect(dbOptions.url).toEqual("http://test2");
        expect(dbOptions.cache).toEqual(true);
        expect(dbOptions.authSource).toEqual("true.");
        expect(dbOptions.port).toEqual(80);
    });

    it('should override databases options', async () => {
        let options = new FultonAppOptions("test");
        options.databases.set("test3", {
            type: "mongodb",
            url: "url",
            port: 88
        });

        process.env[`test.options.databases[test3].url`] = "http://test"
        
        options.loadDatabaseOptions();

        let dbOptions = options.databases.get("test3") as MongoConnectionOptions;
        expect(dbOptions).toBeTruthy();
        expect(dbOptions.port).toEqual(88);
    });
});