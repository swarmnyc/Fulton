import * as fs from 'fs';
import { Middleware, NextFunction, Request, Response, PathIdentifier, EntityRouter } from "../index";

import { FultonApp } from "../fulton-app";
import { OpenApiSpec, PathItemObject, ParameterObject, SchemaObject } from '@loopback/openapi-spec';
import { MimeTypes } from '../constants';

let urlJoin = require('url-join');

export default function DocsInitializer(app: FultonApp) {
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
        parameters: {}
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

    docs.parameters["QueryParams"] = queryParams;
    docs.definitions["QueryParams"] = queryParamSchema;

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
                parameters: []
            };

            if (entity) {
                switch (action.property) {
                    case "list":
                        actionDoc.parameters.push({
                            "$ref": "#/parameters/QueryParams"
                        });
                        break;
                }
            }

            doc[action.method] = actionDoc;
        }
    }


    return docs;
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

let queryParams: ParameterObject = {
    name: " Query Params",
    in: "query",
    description: "the params for filter, select fields, includes related entities and pagination",
    required: false,
    schema: {
        $ref: "#/definitions/QueryParams"
    }
}

let queryParamSchema: SchemaObject = {
    type: "object",
    properties: {
        filter: {
            type: "string",
            example: "filter[id]=theId&filter[name][$like]=portOfName",
            description: "filter the entities"
        },
        sort: {
            type: "string",
            example: "sort=columnA,-columnB",
            description: "sort the entities"
        }
    }
}