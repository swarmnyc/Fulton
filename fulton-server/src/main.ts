// don't import this file, like "./main" which cause circular module imports

export * from "./interfaces";
export * from "./keys";

export * from "./fulton-app";
export * from "./fulton-log";
export * from "./app-launcher";
export * from "./options/fulton-app-options";

export * from "./helpers/index";
export * from "./common/index";
export * from "./identity/index";
export * from "./services/index";
export * from "./routers/index";

export * from "./entities/entity-decorators";

try {
    //export EntityService if typeorm is installed
    if (require.resolve("typeorm")) {
        module.exports.EntityService = require("./entities/entity-service").EntityService
    }
} catch (error) { }
