import * as fs from 'fs';
import * as lodash from 'lodash';

import { Middleware, NextFunction, Request, Response, PathIdentifier, EntityRouter } from "../index";

import { FultonApp } from "../fulton-app";
import { OpenApiSpec, PathItemObject, ParameterObject, SchemaObject, DefinitionsObject, ResponseObject, ParametersDefinitionsObject } from '@loopback/openapi-spec';
import { MimeTypes } from '../constants';
import { entity, column } from '../re-export';

let urlJoin = require('url-join');

export default function docsInitializer(app: FultonApp) {
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

    generatePath(app, docs);

    return docs;
}

function generateDefinitions(app: FultonApp, definitions: DefinitionsObject) {
    app.entityMetadatas.forEach((metadata, entity) => {
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

            let def = "#/definitions/" + entity.name;
            let res: ResponseObject;
            let body: ParameterObject;

            if (entity) {
                switch (action.property) {
                    case "list":
                        actionDoc.parameters.push(...queryParamsRef);

                        res = lodash.clone(operationResultResponse);

                        res.schema.properties.data.items.$ref = def

                        actionDoc.responses["200"] = res;
                        break;
                    case "detail":
                        actionDoc.parameters.push({
                            $ref: "#parameters/Id"
                        })

                        res = lodash.clone(operationOneResultResponse)

                        res.schema.properties.data.$ref = def

                        actionDoc.responses["200"] = res;
                        break;
                    case "create":
                        body = lodash.clone(entityBody)
                        body.schema.properties.data.$ref = def

                        actionDoc.parameters.push(body);

                        res = lodash.clone(operationOneResultResponse)
                        res.schema.properties.data.$ref = def
                        actionDoc.responses["200"] = res;
                        break;
                    case "update":
                        actionDoc.parameters.push({
                            $ref: "#parameters/Id"
                        })

                        body = lodash.clone(entityBody)
                        body.schema.properties.data.$ref = def

                        actionDoc.parameters.push(body);

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

let operationResultResponse: ResponseObject = {
    description: "success",
    schema: {
        type: "object",
        properties: {
            data: {
                type: "array",
                items: {}
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

let operationOneResultResponse: ResponseObject = {
    description: "success",
    schema: {
        type: "object",
        properties: {
            data: {
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

let entityBody: ParameterObject = {
    name: "body",
    in: "body",
    required: true,
    schema: {
        type: "object",
        properties: {
            data: {
                $ref: "#/definitions/"
            }
        }
    }
};

