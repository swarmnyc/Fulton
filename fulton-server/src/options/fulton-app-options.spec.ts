import { MongoConnectionOptions } from "typeorm/driver/mongodb/MongoConnectionOptions";
import { FultonApp } from '../fulton-app';
import { FultonAppOptions } from './fulton-app-options';

class MyFultonApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void | Promise<void> {
        options.server.httpPort = 888;
    }

    protected initDatabases(): Promise<void> {
        return;
    }

    protected initRepositories(): Promise<void> {
        return;
    }
}

describe('Fulton App Options', () => {
    afterAll(() => {
        delete process.env[`PORT`]
    })

    it('should init options', async () => {
        let app = new MyFultonApp();

        process.env[`PORT`] = "7777"

        process.env[`${app.appName}.options.index.enabled`] = "1"

        process.env[`${app.appName}.options.logging.defaultLoggerLevel`] = "info"
        process.env[`${app.appName}.options.logging.defaultLoggerColorized`] = "false"
        process.env[`${app.appName}.options.logging.httpLoggerEnabled`] = "1"

        process.env[`${app.appName}.options.server.httpEnabled`] = "0"
        process.env[`${app.appName}.options.server.httpsEnabled`] = "true"
        process.env[`${app.appName}.options.server.httpPort`] = "777"
        process.env[`${app.appName}.options.server.httpsPort`] = "999"

        await app.init();

        expect(app.options.index.enabled).toEqual(true);

        expect(app.options.logging.defaultLoggerLevel).toEqual("info");
        expect(app.options.logging.defaultLoggerColorized).toEqual(false);
        expect(app.options.logging.httpLoggerEnabled).toEqual(true);

        expect(app.options.server.httpEnabled).toEqual(false);
        expect(app.options.server.httpsEnabled).toEqual(true);
        expect(app.options.server.httpPort).toEqual("777");
        expect(app.options.server.httpsPort).toEqual("999");
        expect(app.options.server.clusterWorkerNumber).toBeUndefined();

        delete process.env[`${app.appName}.options.server.httpPort`]

        await app.init();

        expect(app.options.server.httpPort).toEqual("7777");
    });

    it('should override', async () => {
        let app = new MyFultonApp();
        app.options.index.set({
            message: "test",
        })

        await app.init();
        expect(app.options.index.message).toEqual("test");
    });

    it('should load default database options', async () => {
        let options = new FultonAppOptions("test", "api");

        process.env[`test.options.database.url`] = "http://test"
        process.env[`test.options.database.cache`] = "true"
        process.env[`test.options.database.authSource`] = "true."
        process.env[`test.options.database.port`] = "80"

        options.init();

        let dbOptions = options.databases.get("default") as MongoConnectionOptions;
        expect(dbOptions).toBeTruthy();
        expect(dbOptions.url).toEqual("http://test");
        expect(dbOptions.cache).toEqual(true);
        expect(dbOptions.authSource).toEqual("true.");
        expect(dbOptions.port).toEqual(80);
    });

    it('should load databases options', async () => {
        let options = new FultonAppOptions("test", "api");

        process.env[`test.options.databases.test.url`] = "http://test"
        process.env[`test.options.databases.test.cache`] = "true"
        process.env[`test.options.databases.test.authSource`] = "true."
        process.env[`test.options.databases.test.port`] = "80"

        options.init();

        let dbOptions = options.databases.get("test") as MongoConnectionOptions;
        expect(dbOptions).toBeTruthy();
        expect(dbOptions.url).toEqual("http://test");
        expect(dbOptions.cache).toEqual(true);
        expect(dbOptions.authSource).toEqual("true.");
        expect(dbOptions.port).toEqual(80);

        process.env[`test.options.databases.test2.url`] = "http://test2"
        process.env[`test.options.databases.test2.cache`] = "true"
        process.env[`test.options.databases.test2.authSource`] = "true."
        process.env[`test.options.databases.test2.port`] = "80"

        options.init();

        dbOptions = options.databases.get("test2") as MongoConnectionOptions;
        expect(dbOptions).toBeTruthy();
        expect(dbOptions.url).toEqual("http://test2");
        expect(dbOptions.cache).toEqual(true);
        expect(dbOptions.authSource).toEqual("true.");
        expect(dbOptions.port).toEqual(80);
    });

    it('should override databases options', async () => {
        let options = new FultonAppOptions("test", "api");
        options.databases.set("test3", {
            type: "mongodb",
            url: "url",
            port: 88
        });

        process.env[`test.options.databases[test3].url`] = "http://test"

        options.init();

        let dbOptions = options.databases.get("test3") as MongoConnectionOptions;
        expect(dbOptions).toBeTruthy();
        expect(dbOptions.port).toEqual(88);
    });

    it('should load identity options', async () => {
        let options = new FultonAppOptions("loadTest", "api");

        options.identity.google.clientId = "abc";
        options.identity.google.clientSecret = "abc";

        options.identity.github.clientSecret = "abc";

        process.env[`loadTest.options.identity.google.clientId`] = "cda"
        process.env[`loadTest.options.identity.google.clientSecret`] = "cda"

        options.init();

        expect(options.identity.google.clientId).toEqual("cda");
        expect(options.identity.google.clientSecret).toEqual("cda");

        expect(options.identity.github.clientSecret).toEqual("abc");

    });

    it('should load email and smtp options', async () => {
        let options = new FultonAppOptions("loadTest", "api");

        options.notification.email.set({
            bcc: "bcc@server.com"
        });

        process.env[`loadTest.options.notification.email.sender`] = "sender@server.com"
        process.env[`loadTest.options.notification.email.cc`] = "cc@server.com"

        options.notification.email.smtp.set({
            port: 123
        })

        process.env[`loadTest.options.notification.email.smtp.host`] = "host"
        process.env[`loadTest.options.notification.email.smtp.secure`] = "true"
        process.env[`loadTest.options.notification.email.smtp.auth.username`] = "username"
        process.env[`loadTest.options.notification.email.smtp.auth.password`] = "password"

        options.init();

        expect(options.notification.email.sender).toEqual("sender@server.com");
        expect(options.notification.email.cc).toEqual("cc@server.com");
        expect(options.notification.email.bcc).toEqual("bcc@server.com");

        expect(options.notification.email.smtp.host).toEqual("host");
        expect(options.notification.email.smtp.port).toEqual(123);
        expect(options.notification.email.smtp.secure).toEqual(true);
        expect(options.notification.email.smtp.auth.username).toEqual("username");
        expect(options.notification.email.smtp.auth.password).toEqual("password");
    });
});