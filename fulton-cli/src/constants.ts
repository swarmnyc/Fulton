import * as path from 'path';

let debug = path.extname(__filename) == ".ts"

export const AppRoot = path.normalize(path.resolve(path.join(__dirname, debug ? ".." : ".")))
export const AppVersion = require(`${debug ? ".." : "."}/package.json`).version

export const DatabaseChoices = [
    { name: "MongoDB", value: "mongodb" },
    { name: "MySQL", value: "mysql" },
    { name: "MS SQL Server", value: "mssql" },
    { name: "PostgreSQL", value: "postgres" },
]

export const FeaturesChoices = [
    { name: "Identity - for user register, login, authenticate, etc.", value: "identity" },
    { name: "Google login", value: "oauth-google" },
    { name: "Facebook login", value: "oauth-facebook" },
    { name: "GitHub login", value: "oauth-github" },
    { name: "Api docs", value: "api-docs" },
    { name: "Http response compression", value: "compression" },
    { name: "Http CORS", value: "cors" },
    { name: "Send email", value: "email" },
    { name: "json-api Format", value: "json-api" }
]