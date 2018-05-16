import * as inquirer from "inquirer";

export interface CreateProjectOptions {
    name: string;
    test: boolean;
    databases: string[];
    features: string[];
}

export interface Feature extends inquirer.objects.ChoiceOption {
    short?: string;
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