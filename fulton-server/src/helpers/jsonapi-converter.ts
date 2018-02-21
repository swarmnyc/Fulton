import * as lodash from 'lodash';

// Cannot find other good package to handle convertion, so write it by ourself,
// but the features isn't complete yet.
// maybe make it independent package. 

export interface JsonApiConverterOptions {
    /**
     * the domain includes protocol, like http://example.com/
     */
    domain?: string;
}

export interface JsonApiSerializeOptions {
    /**
     * current url
     */
    baseUrl: string;
    /**
     * the domain includes protocol, like http://example.com/
     */
    domain?: string;

    /**
     * the value that pass to other function which like linkFn
     */
    args?: any;
}

export interface JsonApiRelationshipOptions {
    /**
     * the type of the relationship, it have to be registered too.
     */
    type: string;

    linkFn?: any;
}

export interface JsonApiTypeOptions {
    /**
     * the name of property for id,
     * the default value is `id`
     */
    id?: string;

    /**
     * the names properties that can be converted, ignore others 
     */
    attributes?: string[];

    /**
     * relationship options
     */
    relationships?: {
        [key: string]: JsonApiRelationshipOptions
    }

    /**
     * the pamaters
     */
    path?: string;

    /**
     * the function to generate links for every data
     */
    linksFn?: (options: JsonApiSerializeOptions, typeOtions: JsonApiTypeOptions, data: JsonApiData) => JsonApiLinks;

    /**
     * the function to generate root links
     */
    rootLinksFn?: (options: JsonApiSerializeOptions) => JsonApiRootLinks;
}

export interface JsonApiRootLinks {
    first?: string;
    prev?: string;
    next?: string;
    last?: string;

    meta?: any;
}

export interface JsonApiLinks {
    self?: string;
    [link: string]: string
}

export interface JsonApiIdData {
    id?: string;
    type?: string;
}

export interface JsonApiData {
    id?: string;
    type?: string;
    links?: JsonApiLinks;
    attributes?: {
        [key: string]: any;
    };
    relationships?: {
        [key: string]: JsonApiRelationshipData;
    };
}

export interface JsonApiRelationshipData {
    links?: JsonApiLinks;
    data?: JsonApiIdData | JsonApiIdData[];
}

export interface JsonApiResult {
    data?: JsonApiData | JsonApiData[];
    errors?: any;
    links?: JsonApiRootLinks;
    included?: JsonApiData[];
    meta?: any;
}

const defaultOptions = {
    id: "id"
}

const emptyIncluded: any[] = [];

export class JsonApiConverter {
    private typeMap = new Map<string, JsonApiTypeOptions>();

    constructor(public options?: JsonApiConverterOptions) {
        if (!options) {
            this.options = {};
        }
    }

    isRegister(type: string): boolean {
        return this.typeMap.has(type);
    }

    register(type: string, options: JsonApiTypeOptions) {
        if (!options.attributes) {
            options.attributes = []
        }

        if (!options.relationships) {
            options.relationships = {}
        }

        this.typeMap.set(type, options);
    }

    serialize(type: string, items: any | any[], options?: JsonApiSerializeOptions) {
        return new JsonApiSerializer(this.typeMap, options).exec(type, items);
    }

    deserialize(result: JsonApiResult): any {
        if (!result || !result.data) return;

        let data = result.data;
        let included = result.included || emptyIncluded;

        if (data instanceof Array) {
            return data.map((item) => this.deserializeData(item, included));
        } else {
            return this.deserializeData(data, included);
        }
    }

    private deserializeData(data: JsonApiData, included: JsonApiData[]): any {
        let options = this.typeMap.get(data.type) || defaultOptions;
        let json: any = {};

        json[options.id] = data.id;

        if (data.attributes) {
            Object.assign(json, data.attributes);
        }

        //relationships
        if (data.relationships) {
            let refProps = Object.getOwnPropertyNames(data.relationships);
            for (const prop of refProps) {
                let ref: JsonApiRelationshipData = data.relationships[prop];

                if (ref.data instanceof Array) {
                    json[prop] = ref.data.map((item) => this.deserializeRelationData(item, included));
                } else {
                    json[prop] = this.deserializeRelationData(ref.data, included);
                }
            }
        }

        return json;
    }

    private deserializeRelationData(data: JsonApiData, included: JsonApiData[]): any {
        let includedData = included.find((d) => {
            return d.type == data.type && d.id == data.id;
        })

        if (includedData) {
            return this.deserializeData(includedData, included);
        } else {
            let options = this.typeMap.get(data.type) || defaultOptions;
            let json: any = {};

            json[options.id] = data.id;
            return json;
        }
    }
}

/**
 * Data Serializer, for a scope that can be exec only once
 */
class JsonApiSerializer {
    result: JsonApiResult = {};
    included: JsonApiData[] = [];

    constructor(private typeMap: Map<string, JsonApiTypeOptions>, private options: JsonApiSerializeOptions) { }

    exec(type: string, items: any | any[]) {
        if (items) {
            if (items instanceof Array) {
                this.result.data = items.map((item) => this.serializeData(type, item));
            } else {
                this.result.data = this.serializeData(type, items);
            }

            if (this.included.length > 0) {
                this.result.included = this.included;
            }
        } else {
            this.result.data = [];
        }

        let typeOpts = this.typeMap.get(type);

        if (typeOpts.rootLinksFn) {
            this.result.links = typeOpts.rootLinksFn(this.options);
        }

        return this.result;
    }

    serializeData(type: string, item: any): JsonApiData {
        let typeOpts = this.typeMap.get(type);
        let data: JsonApiData = {};
        data.id = item[typeOpts.id];
        data.type = type;
        // data.links = links

        data.attributes = lodash.pick(item, typeOpts.attributes);

        // relationships
        let refProps = Object.getOwnPropertyNames(typeOpts.relationships);
        if (refProps.length > 0) {
            data.relationships = {};

            for (const prop of refProps) {
                let relOpts = typeOpts.relationships[prop];
                let relItems = item[prop];
                if (relItems) {
                    data.relationships[prop] = this.serializeRelationData(relOpts, item[prop]);
                }
            }
        }

        if (typeOpts.linksFn) {
            data.links = typeOpts.linksFn(this.options, typeOpts, data);
        }

        return data;
    }

    serializeRelationData(relOptions: JsonApiRelationshipOptions, items: any | any[]): JsonApiRelationshipData {
        let refData;
        if (items instanceof Array) {
            refData = items.map((item) => {
                let data = this.serializeData(relOptions.type, item);
                return this.processInclude(data);
            });
        } else {
            let data = this.serializeData(relOptions.type, items);
            refData = this.processInclude(data);
        }

        return {
            // TODO: JSON API relation data
            // links:links
            data: refData
        }
    }

    processInclude(data: JsonApiData): JsonApiIdData {
        //skip if no attributes and relationships;
        if ((data.attributes && Object.getOwnPropertyNames(data.attributes).length > 0) ||
            (data.relationships && Object.getOwnPropertyNames(data.relationships).length > 0)) {
            this.included.push(data);
        }

        return {
            id: data.id,
            type: data.type
        }
    }
}