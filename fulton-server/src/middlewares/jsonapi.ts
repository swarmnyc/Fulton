import * as qs from "qs";
import { NextFunction, OperationOneResult, OperationResult, Request, Response, Type, QueryParams } from "../index";

import { FultonApp } from "../fulton-app";
import { MimeTypes } from "../constants";
import { getRelatedToMetadata } from "../entities/related-decorators-helpers";
import { JsonApiConverter, JsonApiTypeOptions, JsonApiSerializeOptions, JsonApiRootLinks } from "../helpers/jsonapi-converter";
import { OperationResultPagination } from "../interfaces";


module.exports = function (app: FultonApp) {
    let converter: JsonApiConverter;

    // init jsonapi needs after initRouters, but middleware have to register before initRouters
    // so add a hook.
    app.events.once("didInitRouters", (app) => {
        converter = initConverter(app);
    });

    // middlewares;
    return function (req: Request, res: Response, next: NextFunction) {
        if (req.is(MimeTypes.jsonApi) && req.body.data) {
            // jsonapi to json
            res.locals.rawBody = req.body;

            let data = converter.deserialize(req.body);

            req.body = {
                data: data
            }
        }

        if (req.accepts(MimeTypes.jsonApi)) {
            // json to jsonapi
            res.send = new Proxy(res.send, {
                apply: (send: Function, thisArg: Response, args: any[]) => {
                    if (args && args.length > 0 && args[0].data) {
                        let body: (OperationResult | OperationOneResult) = args[0];
                        let data = body.data;
                        let entityType: Type

                        if (data instanceof Array) {
                            if (data.length > 0) {
                                entityType = data[0].constructor
                            }
                        } else {
                            entityType = data.constructor
                        }

                        if (entityType) {
                            res.set("content-type", MimeTypes.jsonApi);

                            let serializeOpts: JsonApiSerializeOptions = {
                                baseUrl: req.baseUrl,
                                args: {
                                    queryParams: req.queryParams,
                                    pagination: (<OperationResult>body).pagination
                                }
                            };

                            if (converter.options.domain) {
                                serializeOpts.domain = converter.options.domain;
                            } else {
                                serializeOpts.domain = `${req.protocol}://${req.get("host")}`
                            }

                            let result = converter.serialize(entityType.name, data, serializeOpts);

                            args[0] = result;
                        }
                    }

                    send.apply(thisArg, args);
                },
            })
        }

        next();
    }
}

function initConverter(app: FultonApp): JsonApiConverter {
    let converter: JsonApiConverter = new JsonApiConverter();

    app.events.emit("onInitJsonApi", app, converter);

    for (const conn of app.connections) {
        for (const metadata of conn.entityMetadatas) {
            let type = metadata.target as Type;

            if (!converter.isRegister(type.name)) {
                let relatedToMetadata = getRelatedToMetadata(type);
                let id: string;

                if (metadata.objectIdColumn) {
                    id = metadata.objectIdColumn.propertyName;
                } else if (metadata.primaryColumns.length > 0) {
                    //TODO: ids for SQL
                    id = metadata.primaryColumns[0].propertyName;
                } else {
                    id = "id"
                }

                let attributes = metadata.columns
                    .filter((col) => {
                        return col.isSelect && !col.isObjectId && !col.isPrimary && relatedToMetadata[col.propertyName] == null
                    })
                    .map((col) => col.propertyName)

                let options: JsonApiTypeOptions = {
                    id: id,
                    attributes: attributes,
                    relationships: {},
                    rootLinksFn: rootLinks
                }

                //TODO: relationships for SQL
                for (const propertyName of Object.getOwnPropertyNames(relatedToMetadata)) {
                    let refType = relatedToMetadata[propertyName];

                    options.relationships[propertyName] = {
                        type: refType.name
                    }
                }

                converter.register(type.name, options);
            }
        }
    }

    app.events.emit("didInitJsonApi", app, converter);

    return converter;
}

function rootLinks(opts: JsonApiSerializeOptions): JsonApiRootLinks {
    if (opts.args && opts.args.queryParams && opts.args.pagination) {
        let pagination = opts.args.pagination as OperationResultPagination
        let queryParams = opts.args.queryParams as QueryParams;

        queryParams.pagination.size = pagination.size;

        let links: JsonApiRootLinks = {}
        let last = Math.ceil(pagination.total / pagination.size) - 1;

        queryParams.pagination.index = 0;
        links.first = `${opts.domain}${opts.baseUrl}?${qs.stringify(queryParams)}`;

        queryParams.pagination.index = last;
        links.last = `${opts.domain}${opts.baseUrl}?${qs.stringify(queryParams)}`;

        if (pagination.index > 0) {
            queryParams.pagination.index = pagination.index - 1;
            links.prev = `${opts.domain}${opts.baseUrl}?${qs.stringify(queryParams)}`;
        }

        if (pagination.index < last) {
            queryParams.pagination.index = pagination.index + 1;
            links.next = `${opts.domain}${opts.baseUrl}?${qs.stringify(queryParams)}`;
        }

        links.meta = pagination;

        return links;
    }
}