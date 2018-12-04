import * as qs from 'qs';
import * as url from 'url';
import { EntityRouter } from '../routers/entity-router';
import { EventKeys } from '../keys';
import { FultonApp } from '../fulton-app';
import { Helper } from '../helpers/helper';
import { JsonApiConverter, JsonApiData, JsonApiLinks, JsonApiRootLinks, JsonApiSerializeOptions, JsonApiTypeOptions } from '../helpers/jsonapi-converter';
import { MimeTypes } from '../constants';
import { OperationManyResult, OperationOneResult, Type } from '../interfaces';
import { Request, Response, NextFunction } from '../alias';
import { OperationResultPagination } from '../interfaces';
import { Router } from '../routers/router';

module.exports = function (app: FultonApp) {
    let converter: JsonApiConverter;

    // init jsonapi needs after initRouters, but middleware have to register before initRouters
    // so add a hook.
    app.events.once(EventKeys.AppDidInitRouters, (app) => {
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

        if (req.get("accept") == MimeTypes.jsonApi) {
            // json to jsonapi
            res.send = new Proxy(res.send, {
                apply: (send: Function, thisArg: Response, args: any[]) => {
                    if (args && args.length == 1 && typeof args[0] == "object") {
                        if (args[0].data) {
                            let body: (OperationManyResult & OperationOneResult) = args[0];
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
                                        query: req.query,
                                        pagination: body.pagination
                                    }
                                };

                                if (converter.options.domain) {
                                    serializeOpts.domain = converter.options.domain;
                                } else {
                                    serializeOpts.domain = Helper.urlResolve(req);
                                }

                                let result = converter.serialize(entityType.name, data, serializeOpts);

                                args[0] = JSON.stringify(result);
                            }
                        } else if (args[0].error) {
                            // JSONAPI use error array
                            res.set("content-type", MimeTypes.jsonApi);
                            args[0] = JSON.stringify({ errors: [args[0].error] })
                        }
                    }

                    send.apply(thisArg, args);
                },
            }) as any
        }

        next();
    }
}

function initConverter(app: FultonApp): JsonApiConverter {
    let converter: JsonApiConverter = new JsonApiConverter();

    app.events.emit(EventKeys.OnInitJsonApi, app, converter);

    app.entityMetadatas.forEach((metadata, type) => {
        let relatedToMetadata = metadata.relatedToMetadata;
        let id: string;

        if (metadata.primaryColumns.length > 0) {
            // only support one primary
            id = metadata.primaryColumns[0].propertyPath;
        } else {
            id = "id"
        }

        let attributes = metadata.columns
            .filter((col) => {
                return col.isSelect &&
                    !col.isPrimary &&
                    col.embeddedMetadata == null &&
                    relatedToMetadata[col.propertyPath] == null
            })
            .map((col) => col.propertyPath)

        if (metadata.embeddeds) {
            for (const embedded of metadata.embeddeds) {
                attributes.push(embedded.propertyPath);
            }
        }

        let options: JsonApiTypeOptions = {
            id: id,
            attributes: attributes,
            relationships: {},
            linksFn: dataLinks,
            rootLinksFn: rootLinks
        }

        //TODO: relationships for SQL
        for (const propertyName of Object.getOwnPropertyNames(relatedToMetadata)) {
            let refType = relatedToMetadata[propertyName];

            options.relationships[propertyName] = {
                type: refType.name
            }
        }

        // for router path
        let entityRouter = app.routers.find((router: Router) => {
            if (router instanceof EntityRouter) {
                return router["metadata"].router.entity == type
            }

            return false;
        });

        if (entityRouter) {
            options.path = entityRouter["metadata"].router.path.toString();
        }

        converter.register(type.name, options);
    })

    app.events.emit(EventKeys.AppDidInitJsonApi, app, converter);

    return converter;
}

function rootLinks(opts: JsonApiSerializeOptions): JsonApiRootLinks {
    if (opts.args && opts.args.query && opts.args.pagination) {
        let pagination = opts.args.pagination as OperationResultPagination
        let query = opts.args.query;

        let links: JsonApiRootLinks = {}
        let last = Math.ceil(pagination.total / pagination.size) - 1;

        if (query.pagination == null) query.pagination = {}

        query.pagination.size = pagination.size;

        query.pagination.index = 0;
        links.first = `${opts.domain}${opts.baseUrl}?${qs.stringify(query)}`;

        if (last == 0) {
            links.last = links.first;
        } else {
            query.pagination.index = last;
            links.last = `${opts.domain}${opts.baseUrl}?${qs.stringify(query)}`;
        }

        if (pagination.index > 0) {
            query.pagination.index = pagination.index - 1;
            links.prev = `${opts.domain}${opts.baseUrl}?${qs.stringify(query)}`;
        }

        if (pagination.index < last) {
            query.pagination.index = pagination.index + 1;
            links.next = `${opts.domain}${opts.baseUrl}?${qs.stringify(query)}`;
        }

        links.meta = pagination;

        return links;
    }
}

function dataLinks(options: JsonApiSerializeOptions, typeOptions: JsonApiTypeOptions, data: JsonApiData): JsonApiLinks {
    if (typeOptions.path) {
        return {
            self: url.resolve(options.domain, typeOptions.path) + "/" + data.id
        }
    }
}