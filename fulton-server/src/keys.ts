export enum DiKeys {
    EntityServiceFactory = "EntityServiceFactory",
    FultonApp = "FultonApp",
    MongoEntityRunner = "MongoEntityRunner",
    EmailService = "EmailService",
    TemplateService = "TemplateService",
}

export enum EventKeys {
    AppDidInit = "AppDidInit",
    AppDidInitCors = "AppDidInitCors",
    AppDidInitDatabases = "AppDidInitDatabases",
    AppDidInitDiContainer = "AppDidInitDiContainer",
    AppDidInitDocs = "AppDidInitDocs",
    AppDidInitErrorHandler = "AppDidInitErrorHandler",
    AppDidInitFormatter = "AppDidInitFormatter",
    AppDidInitHttpLogging = "AppDidInitHttpLogging",
    AppDidInitIdentity = "AppDidInitIdentity",
    AppDidInitIndex = "AppDidInitIndex",
    AppDidInitJsonApi = "AppDidInitJsonApi",
    AppDidInitLogging = "AppDidInitLogging",
    AppDidInitMiddlewares = "AppDidInitMiddlewares",
    AppDidInitProviders = "AppDidInitProviders",
    AppDidInitRepositories = "AppDidInitRepositories",
    AppDidInitRouters = "AppDidInitRouters",
    AppDidInitServer = "AppDidInitServer",
    AppDidInitServices = "AppDidInitServices",
    AppDidInitStaticFile = "AppDidInitStaticFile",

    UserDidRegister = "UserDidRegister",
    
    OnInitJsonApi = "OnInitJsonApi",
}