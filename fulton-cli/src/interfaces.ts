export interface CreateProjectOptions {
    name: string;
    databases: string[];
    features: string[];
}

export interface PackageOptions {
    name: string;

    isCompressionEnabled: boolean;
    isCorsEnabled: boolean;

    isDatabaseEnabled: boolean;
    isMongoDbEnabled: boolean;

    isIdentityEnabled?: boolean;
    isGoogleAuthEnabled: boolean;
    isGitHubAuthEnabled: boolean;
    isFacebookAuthEnabled: boolean;

    isApiDocsEnabled: boolean;

    isEmailNotificationEnabled: boolean;
}