import * as path from 'path';
import { Feature } from './interfaces';

let debug = path.extname(__filename) == ".ts"

export const AppRoot = path.normalize(path.resolve(path.join(__dirname, debug ? ".." : ".")))
export const AppVersion = require(`${debug ? ".." : "."}/package.json`).version

export const DatabasePackages = ["typeorm", "validator", "class-validator"]
export const Packages = ["dotenv", "fulton-server"]
export const DevPackages = ["@types/node", "rimraf", "ts-node", "typescript"]

export const DatabaseList: Feature[] = [
    { name: "MongoDB", value: "mongodb", packages: ["mongodb"] },
    { name: "MySQL", value: "mysql", packages: [] },
    { name: "MS SQL Server", value: "mssql", packages: [] },
    { name: "PostgreSQL", value: "postgres", packages: [] },
]

export const FeatureList: Feature[] = [
    {
        name: "Identity - for user register, login, authenticate, etc.", value: "identity",
        packages: ["jws", "passport", "passport-http-bearer", "passport-local", "password-hash"]
    },
    { name: "Google login", value: "oauth-google", packages: ["google-auth-library"] },
    { name: "Facebook login", value: "oauth-facebook", packages: ["passport-facebook"] },
    { name: "GitHub login", value: "oauth-github", packages: ["passport-github"] },
    { name: "Api docs", value: "api-docs", packages: ["swagger-ui-express"] },
    { name: "Http response compression", value: "compression", packages: ["compression"] },
    { name: "Http CORS", value: "cors", packages: ["cors"] },
    { name: "Send email", value: "email", packages: ["nodemailer"] },
    { name: "json-api Format", value: "json-api", packages: [] }
]