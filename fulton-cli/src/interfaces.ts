import * as inquirer from "inquirer";

export interface Type<T=any> extends Function {
    new(...args: any[]): T;
}

export interface IFultonConfig {
    version?: string,
    databases?: {
        [key: string]: string;
    };

    features?: string[];
}

export interface CreateProjectOptions {
    name: string;
    dry: boolean;
    databases: string[];
    features: string[];
}

export interface Feature extends inquirer.objects.ChoiceOption {
    short?: string;
    packages?: string[];
    devPackages?: string[];
}

export interface DatabaseOptions {
    name: string;
    type: string;
    options: string;
}

export interface AppOptions {
    projectName: string;
    projectNameSafe: string;
    appName: string;
    appNameSafe: string;

    isCompressionEnabled: boolean;
    isCorsEnabled: boolean;
    isJsonApiEnabled: boolean;
    isApiDocsEnabled: boolean;

    isDatabaseEnabled: boolean;
    isMongoDbEnabled: boolean;
    databases?: DatabaseOptions[];

    isIdentityEnabled?: boolean;
    isGoogleAuthEnabled: boolean;
    isGitHubAuthEnabled: boolean;
    isFacebookAuthEnabled: boolean;

    isCacheEnabled: boolean;
    cacheType: string;

    isEmailNotificationEnabled: boolean;

    isDockerEnabled: boolean;
}

export interface GenerateFileOptions {
    schematic: "entity" | "entity-router" | "router" | "service";

    /**
     * the name typed by users
     */
    name: string;

    /**
     * the class name normalized by name
     */
    className: string;

    /**
     * the file name normalized by name
     */
    fileName: string;

    /**
     * the file path normalized by name
     */
    filePath: string;

    force: boolean;

    notOpen: boolean;

    notImport: boolean;

    templatePath: string;

    // options for entity
    dbConn: string;
    dbEngine: string;
    dbTableName: string;

    // options for entity, entity-router
    entityName: string;
    entityFileName: string;

    // options for entity-router, router
    routerPath: string;
}

export interface SchematicOptions {
    folder: string;
    property: string;
    suffix: string;
    templatePath?: string;
    action: (opts: GenerateFileOptions) => void;
}

export interface UpdateFeatureOptions {
    features: string[]
    dry: boolean;
    addPackages: Set<string>
    addDevPackages: Set<string>
    removePackages: Set<string>
}