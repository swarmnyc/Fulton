import * as fs from 'fs';
import * as lodash from 'lodash';

import { DefinitionsObject, OpenApiSpec, OperationObject, ParameterObject, ParametersDefinitionsObject, PathItemObject, PathsObject, ResponseObject, SchemaObject } from '@loopback/openapi-spec';
import { Middleware, NextFunction, PathIdentifier, Request, Response, Type } from "../interfaces";
import { column, entity, manyToMany } from '../re-export';

import { FultonApp } from "../fulton-app";
import { MimeTypes } from '../constants';
import { OAuthStrategyOptions } from '../identity/interfaces';
import { EntityRouter } from '../routers/entity-router';

let urlJoin = require('url-join');

module.exports = function (app: FultonApp) {
    let options = app.options.docs;
    let docs: OpenApiSpec;

    if (options.docsFilePath) {
        docs = JSON.parse(fs.readFileSync(options.docsFilePath).toString());
    } else {
        docs = generateDocs(app);
    }

    app.events.emit("didInitDocs", app);

    let docsMiddlewares: Middleware[] = [];
    let jsonMiddlewares: Middleware[] = [];

    if (options.accessKey) {
        let check = checkKey(options.accessKey);
        docsMiddlewares.push(check);
        jsonMiddlewares.push(check);
    }

    let swaggerUi = require('swagger-ui-express');
    const uiOptions = {
        explorer: false,
        customSiteTitle: options.info.title
    }

    docsMiddlewares.push(swaggerUi.serve, swaggerUi.setup(docs, uiOptions));
    app.express.use(options.path, docsMiddlewares);

    jsonMiddlewares.push((req: Request, res: Response) => {
        res.send(docs);
    });

    app.express.use(options.path + ".json", jsonMiddlewares);
}

function generateDocs(app: FultonApp): OpenApiSpec {
    let docs: OpenApiSpec = {
        swagger: "2.0",
        info: app.options.docs.info,
        basePath: "/",
        schemes: [],
        consumes: [],
        produces: [],
        tags: [],
        paths: {},
        definitions: {},
        parameters: parameters,
        responses: {
            Error: errorResponse
        }
    };

    if (app.options.server.httpEnabled) {
        docs.schemes.push("http");
    }

    if (app.options.server.httpsEnabled) {
        docs.schemes.push("https");
    }

    if (app.options.formatter.json) {
        docs.consumes.push(MimeTypes.json);
        docs.produces.push(MimeTypes.json);
    }

    if (app.options.formatter.jsonApi) {
        docs.consumes.push(MimeTypes.jsonApi);
        docs.produces.push(MimeTypes.jsonApi);
    }

    generateDefinitions(app, docs.definitions);

    generateAuthDefinitions(app, docs);

    generatePath(app, docs);

    return docs;
}

function generateDefinitions(app: FultonApp, definitions: DefinitionsObject) {
    app.entityMetadatas.forEach((metadata, entity) => {
        if (entity == app.options.identity.userType) {
            return;
        }

        let schema: SchemaObject = {
            type: "object"
        };

        schema.properties = {};

        for (const column of metadata.columns) {
            let type;
            if (column.type instanceof Function) {
                type = column.type.name.toLocaleLowerCase()
            } else {
                type = column.type || "string";
            }

            schema.properties[column.propertyName] = {
                type: type
            }

            let relType = metadata.relatedToMetadata[column.propertyName];

            if (relType) {
                if (type == "array") {
                    schema.properties[column.propertyName].items = {
                        "$ref": "#/definitions/" + relType.name
                    }
                } else {
                    schema.properties[column.propertyName] = {
                        "$ref": "#/definitions/" + relType.name
                    }
                }
            }
        }

        definitions[entity.name] = schema
    });
}

function generatePath(app: FultonApp, docs: OpenApiSpec) {
    for (const router of app.routers) {
        let tagName: string = router.metadata.router.doc.title || router.constructor.name.replace(/router/i, "");
        docs.tags.push({
            name: tagName,
            description: router.metadata.router.doc.description
        });

        let entity;
        if (router instanceof EntityRouter) {
            entity = router.metadata.router.entity;
        }

        let root = toPath(router.metadata.router.path);
        for (const action of router.metadata.actions) {
            let path = toPath(root, action.path);
            let doc = docs.paths[path];

            if (doc == null) {
                doc = docs.paths[path] = {};
            }

            let actionDoc: PathItemObject = {
                summary: action.doc.title || action.property,
                description: action.doc.description,
                tags: [tagName],
                parameters: [],
                responses: {}
            };

            let res: ResponseObject;

            if (entity) {
                switch (action.property) {
                    case "list":
                        actionDoc.parameters.push(...queryParamsRef);

                        actionDoc.responses["200"] = getOperationResultResponse(entity);
                        break;
                    case "detail":
                        actionDoc.parameters.push({
                            $ref: "#parameters/Id"
                        })

                        actionDoc.responses["200"] = getOperationOneResultResponse(entity);

                        break;
                    case "create":
                        actionDoc.parameters.push(getBodyParameter(entity));

                        actionDoc.responses["200"] = getOperationOneResultResponse(entity);
                        break;
                    case "update":
                        actionDoc.parameters.push({
                            $ref: "#parameters/Id"
                        })

                        actionDoc.parameters.push(getBodyParameter(entity));

                        actionDoc.responses["201"] = {
                            description: "accept"
                        }
                        break;
                    case "delete":
                        actionDoc.parameters.push({
                            $ref: "#parameters/Id"
                        })

                        actionDoc.responses["201"] = {
                            description: "accept"
                        }
                        break;
                }

                actionDoc.responses["400"] = {
                    "$ref": "#responses/Error"
                }
            }

            doc[action.method] = actionDoc;
        }
    }
}

function generateAuthDefinitions(app: FultonApp, docs: OpenApiSpec) {
    let options = app.options.identity;
    if (!options.enabled) {
        return;
    }

    // for access token
    docs.responses["AccessToken"] = {
        description: "Access Token",
        schema: {
            type: "object",
            properties: {
                access_token: { type: "string" },
                token_type: { type: "string" },
                expires_in: { type: "number" },
                refresh_token: { type: "string" }
            }
        }
    }

    let accessTokenResponse = {
        $ref: "#/responses/AccessToken"
    }

    let responses = {
        "200": accessTokenResponse,
        "400": errorResponse
    }

    // for register
    if (options.register) {
        let path = toPath(options.register.path);
        let paths: PathsObject = docs.paths[path] = {}

        let body: SchemaObject = {
            type: "object",
            properties: {},
            required: [
                options.register.usernameField,
                options.register.emailField,
                options.register.passwordField
            ]
        }

        body.properties[options.register.usernameField || "username"] = {
            type: "string"
        }

        body.properties[options.register.emailField || "email"] = {
            type: "string"
        }

        body.properties[options.register.passwordField || "password"] = {
            type: "string"
        }

        for (const field of options.register.otherFields) {
            body.properties[field] = {}
        }

        let actionDoc: OperationObject = {
            summary: "register",
            description: "Register a new user",
            tags: ["Identity"],
            parameters: [
                {
                    name: "body",
                    in: "body",
                    required: true,
                    schema: body
                }
            ],
            responses: responses
        }

        paths[options.register.httpMethod] = actionDoc;
    }

    // for login
    if (options.login) {
        let path = toPath(options.login.path);
        let paths: PathsObject = docs.paths[path] = {}
        let body: SchemaObject = {
            type: "object",
            properties: {},
            required: [options.login.usernameField, options.login.passwordField]
        }

        body.properties[options.login.usernameField || "username"] = {
            type: "string"
        }

        body.properties[options.login.passwordField || "password"] = {
            type: "string"
        }

        let actionDoc: OperationObject = {
            summary: "login",
            description: "user login",
            tags: ["Identity"],
            parameters: [
                {
                    name: "body",
                    in: "body",
                    required: true,
                    schema: body
                }
            ],
            responses: responses
        }

        paths[options.login.httpMethod] = actionDoc;
    }

    let oauthes = ["google", "github"];

    for (const oauth of oauthes) {
        let opts: OAuthStrategyOptions = (<any>options)[oauth];
        if (opts.enabled) {
            let path = toPath(opts.path);

            docs.paths[path] = {
                get: {
                    summary: `${oauth} login`,
                    description: `${oauth} login`,
                    tags: ["Identity"],
                    responses: {
                        "200": {
                            headers: {
                                location: {
                                    description: `${oauth} login page`,
                                    schema: {
                                        type: "string"
                                    }
                                }
                            }
                        }
                    }
                }
            }

            let callbackPath = toPath(opts.callbackPath);

            docs.paths[callbackPath] = {
                get: {
                    summary: `${oauth} login callback`,
                    description: `${oauth} login callback`,
                    tags: ["Identity"],
                    responses: responses
                }
            }
        }
    }
}

function checkKey(accessKey: string): Middleware {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.query.key == accessKey) {
            next();
        } else {
            res.status(401).end();
        }
    }
}

let pathReg = /\/(.*)\/(\w*)/;
let pathReplaceReg = /[\\\?]/;

function toPath(...args: PathIdentifier[]): string {
    let path = "/";

    for (const arg of args) {
        if (arg instanceof Array) {
            path = urlJoin(path, toPath(...arg));
        } else if (arg instanceof RegExp) {
            let reg = arg.toString();
            reg = pathReg.exec(reg)[1];
            reg = reg.replace(pathReplaceReg, "");
            path = urlJoin(path, reg);
        } else {
            path = urlJoin(path, arg);
        }
    }

    return path;
}

function getOperationResultResponse(type: Type): ResponseObject {
    return {
        description: "success",
        schema: {
            type: "object",
            properties: {
                data: {
                    type: "array",
                    items: {
                        $ref: "#/definitions/" + type.name
                    }
                },
                pagination: {
                    type: "object",
                    properties: {
                        index: {
                            type: "number"
                        },
                        size: {
                            type: "number"
                        },
                        total: {
                            type: "number"
                        }
                    }
                }
            }
        }
    }
}

function getOperationOneResultResponse(type: Type): ResponseObject {
    return {
        description: "success",
        schema: {
            type: "object",
            properties: {
                data: {
                    $ref: "#/definitions/" + type.name
                }
            }
        }
    }
}

function getBodyParameter(type: Type): ParameterObject {
    return {
        name: "body",
        in: "body",
        required: true,
        schema: {
            type: "object",
            properties: {
                data: {
                    $ref: "#/definitions/" + type.name
                }
            }
        }
    }
}

let errorResponse: ResponseObject = {
    description: "Error",
    schema: {
        type: "object",
        properties: {
            errors: {
                type: "object",
                properties: {
                    message: {
                        type: "array",
                        items: {
                            type: "string"
                        }
                    },
                    "error-property": {
                        type: "array",
                        items: {
                            type: "string"
                        }
                    }
                }
            }
        }
    }
}

let parameters: ParametersDefinitionsObject = {
    "Id": {
        name: "id",
        in: "path",
        description: "the id of the entity",
        required: true,
        type: "string"
    },
    "Filter": {
        name: "filter[prop]",
        in: "query",
        description: "the params for filter, see https://swarmnyc.gitbooks.io/fulton/content/server/query-params.html for more info",
        required: false,
        type: "string",
        example: "?filter[id]=theId&filter[name][$like]=portOfName"
    },
    "Sort": {
        name: "sort",
        in: "query",
        description: "the params for sort",
        required: false,
        type: "string",
        example: "sort=columnA,-columnB"
    },
    "Select": {
        name: "select",
        in: "query",
        description: "the params for select fields to display",
        required: false,
        type: "string",
        example: "?select=columnA,columnB"
    },
    "Includes": {
        name: "includes",
        in: "query",
        description: "the params for select fields to display",
        required: false,
        type: "string",
        example: "?includes=columnA,columnB"
    },
    "Pagination-Index": {
        name: "pagination[index]",
        in: "query",
        description: "the params for pagination",
        required: false,
        type: "integer",
        example: "?pagination[index]=1"
    },
    "Pagination-Size": {
        name: "pagination[size]",
        in: "query",
        description: "the params for pagination",
        required: false,
        type: "integer",
        example: "?pagination[size]=100"
    }
}

let queryParamsRef = [
    {
        $ref: "#parameters/Filter"
    },
    {
        $ref: "#parameters/Sort"
    },
    {
        $ref: "#parameters/Includes"
    },
    {
        $ref: "#parameters/Select"
    },
    {
        $ref: "#parameters/Pagination-Index"
    },
    {
        $ref: "#parameters/Pagination-Size"
    }
]

