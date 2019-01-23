import { IncomingMessage } from 'http';
import * as https from 'https';
import { Dict } from '../types';
import { Helper } from './helper';

import qs = require('qs');

export interface AwsConfigs {
    accessKey?: string;
    secretKey?: string;
    region?: string;
}

export interface AwsRequestOptions extends https.RequestOptions {
    service: string;
    /**
     * path without querystring
     */
    rawPath?: string;
    query?: Dict;
    region?: string;
    payload?: string | Buffer;
    payloadHash?: string;
}

export interface AwsCanonical {
    canonical: string,
    signedHeaders: string
}

export interface AwsResponse extends IncomingMessage {
    body: string;
}

const Algorithm = "AWS4-HMAC-SHA256"

export class AwsClient {
    constructor(public configs?: AwsConfigs) {
        if (configs == null) this.configs = {}

        this.configs.accessKey = this.configs.accessKey || process.env["AWS_ACCESS_KEY_ID"]
        this.configs.secretKey = this.configs.secretKey || process.env["AWS_SECRET_ACCESS_KEY"]
        this.configs.region = this.configs.region || process.env["AWS_REGION"]

        if (!this.configs.accessKey) throw Error("AWS access key id is undefined")
        if (!this.configs.secretKey) throw Error("AWS secret access key is undefined")
        if (!this.configs.region) throw Error("AWS region id is undefined")
    }

    prepareRequest(options: AwsRequestOptions): void {
        let datetime = this.generateDateTimeTimestamp();
        let date = datetime.substr(0, 8)

        // check options
        options.region = options.region || this.configs.region
        options.path = options.path || "/"
        if (!options.path.startsWith("/")) options.path = "/" + options.path

        if (options.host == null) {
            options.host = `${options.service}.${options.region}.amazonaws.com`
        }

        options.headers = options.headers || {}

        options.headers["Host"] = options.host
        options.headers["X-Amz-Date"] = datetime

        // generate signature
        let canonical = this.generateCanonical(options)
        let hashedCanonical = Helper.hash(canonical.canonical).toString("hex");

        //console.log(`Canonical=\n${canonical.canonical}\n`)

        let scope = `${date}/${options.region}/${options.service}/aws4_request`;

        let stringToString = this.generateStringToSign(datetime, scope, hashedCanonical)

        let signatureSalt = this.generateSignatureSalt(date, options.region, options.service);

        //console.log(`StringToSign=\n${stringToString}\n`)

        let signature = Helper.hmac(stringToString, signatureSalt).toString("hex");

        let authorization = `${Algorithm} Credential=${this.configs.accessKey}/${scope}, SignedHeaders=${canonical.signedHeaders}, Signature=${signature}`

        options.headers["Authorization"] = authorization

        //console.log(`Authorization=${authorization}`)

        if (options.query) {
            options.rawPath = options.path
            options.path += "?" + qs.stringify(options.query)
        }
    }

    protected generateCanonical(options: AwsRequestOptions): AwsCanonical {
        // query
        let queryArr: string[] = []
        if (options.query) {
            let queryKeys = Object.getOwnPropertyNames(options.query).sort()

            for (var key of queryKeys) {
                let value = encodeURIComponent((options.query[key] || "").toString())
                queryArr.push(`${key}=${value}`)
            }
        }

        let queryString = queryArr.join("&")

        // headers
        let canonicalHeaders = ""
        let headerArr: string[] = []

        if (options.headers) {
            let headerKeys = Object.getOwnPropertyNames(options.headers).sort()

            for (var key of headerKeys) {
                let header = key.toLocaleLowerCase();
                let value = (options.headers[key] || "").toString().trim()

                canonicalHeaders += `${header}:${value}\n`
                headerArr.push(header)
            }
        }

        let signedHeaders = headerArr.join(";")

        // payload
        let hashedPayload
        if (options.payloadHash) {
            hashedPayload = options.payloadHash
        } else {
            hashedPayload = Helper.hash(options.payload || "").toString("hex")
        }

        let canonical = `${options.method}\n${options.path}\n${queryString}\n${canonicalHeaders}\n${signedHeaders}\n${hashedPayload}`
        return { canonical, signedHeaders }
    }

    protected generateStringToSign(timestamp: string, scope: string, canonical: string): string {
        return `${Algorithm}\n${timestamp}\n${scope}\n${canonical}`
    }

    protected generateSignatureSalt(timestamp: string, region: string, service: string) {
        let hashedDate = Helper.hmac(timestamp, "AWS4" + this.configs.secretKey);
        let hashedRegion = Helper.hmac(region, hashedDate);
        let hashedService = Helper.hmac(service, hashedRegion);
        let hashedSigning = Helper.hmac("aws4_request", hashedService);

        return hashedSigning;
    }

    protected generateDateTimeTimestamp(): string {
        let now = new Date()
        let pad = (i: number) => i.toString().padStart(2, "0")

        let year = now.getUTCFullYear();
        let month = pad(now.getUTCMonth() + 1);
        let date = pad(now.getUTCDate())

        let hours = pad(now.getUTCHours())
        let mins = pad(now.getUTCMinutes())
        let secs = pad(now.getUTCSeconds())

        return year + month + date + "T" + hours + mins + secs + "Z";
    }

    request(options: AwsRequestOptions): Promise<AwsResponse> {
        return new Promise((resolve, reject) => {
            this.prepareRequest(options)

            let req = https.request(options, (response) => {
                response.on('data', (chunk) => {
                    let res = response as AwsResponse
                    if (res.body) {
                        res.body += chunk.toString()
                    } else {
                        res.body = chunk.toString()
                    }
                });

                response.on('end', () => {
                    resolve(response as AwsResponse)
                });
            })

            req.on('error', (e) => {
                reject(e)
            });

            if (options.payload) {
                req.write(options.payload)
            }

            req.end()
        })
    }
}