export interface CreateProjectOptions {
    name: string;
    test: boolean;
    databases: string[];
    features: string[];
}

export interface Feature {
    name: string;
    value: string;
    packages?: string[];
    devPackages?: string[];
}

export interface AppOptions {
    projectName: string;
    appName: string;

    isCompressionEnabled: boolean;
    isCorsEnabled: boolean;
    isJsonApiEnabled: boolean;
    isApiDocsEnabled: boolean;

    isDatabaseEnabled: boolean;
    isMongoDbEnabled: boolean;
    databaseSettings: string[];

    isIdentityEnabled?: boolean;
    isGoogleAuthEnabled: boolean;
    isGitHubAuthEnabled: boolean;
    isFacebookAuthEnabled: boolean;

    isEmailNotificationEnabled: boolean;
}