import { NextFunction, OperationOneResult, OperationResult, Request, Response, Type } from "../index";

import { FultonApp } from "../fulton-app";
import { MimeTypes } from "../constants";
import { getRelatedToMetadata } from "../entities/related-decorators-helpers";
import { JsonApiConverter, JsonApiTypeOptions } from "../helpers/jsonapi-converter";


module.exports = function (app: FultonApp) {
    var converter = generateConverter(app);

    //register type

    return function (req: Request, res: Response, next: NextFunction) {
        if (req.is(MimeTypes.jsonApi) && req.body.data) {
            // change body
            res.locals.rawBody = req.body;

            let data = converter.deserialize(req.body);

            req.body = {
                data: data
            }
        }

        if (req.accepts(MimeTypes.jsonApi)) {
            // change send
            res.send = new Proxy(res.send, {
                apply: (send: Function, thisArg: Response, args: any[]) => {
                    if (args && args.length > 0 && args[0].data) {
                        // try convert json to jsonapi
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

                            let result = converter.serialize(entityType.name, data);

                            if (body.pagination) {
                                result.meta = body.pagination;
                            }

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

function generateConverter(app: FultonApp): JsonApiConverter {
    let converter = new JsonApiConverter();

    let map = new Map<Type, boolean>();

    for (const conn of app.connections) {
        for (const metadata of conn.entityMetadatas) {
            let type = metadata.target as Type;

            if (!map.has(type)) {
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
                    relationships: {
                    }
                }

                //TODO: relationships for SQL
                for (const propertyName of Object.getOwnPropertyNames(relatedToMetadata)) {
                    let refType = relatedToMetadata[propertyName];

                    options.relationships[propertyName] = {
                        type: refType.name
                    }
                }

                converter.register(type.name, options);

                map.set(type, true);
            }
        }
    }

    return converter;
}