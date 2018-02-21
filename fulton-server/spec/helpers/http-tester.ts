import * as request from 'request';
import * as url from 'url';

import { Headers, OptionsWithUrl, RequiredUriUrl } from 'request';

import { ClientResponse } from 'http';
import { FultonApp } from '../../src/fulton-app';
import FultonLog from '../../src/fulton-log';

export interface HttpResult {
    response?: ClientResponse;
    body?: any;
}

export class HttpTester {
    private headers: Headers;

    constructor(private app: FultonApp) {
        FultonLog.level = "warn";
        this.app.options.logging.httpLoggerEnabled = false;
        this.headers = {};
    }


    private get baseUrl(): string {
        return "http://localhost:" + this.app.options.server.httpPort;
    }

    start(): Promise<void> {
        return this.app.start();
    }

    stop(): Promise<void> {
        return this.app.stop();
    }

    setHeaders(headers: Headers) {
        this.headers = headers;
    }

    get(path: string, queryString?: any, followRedirect?: boolean): Promise<HttpResult> {
        return this.request({
            method: "get",
            url: url.resolve(this.baseUrl, path),
            headers: this.headers,
            qs: queryString,
            followRedirect: followRedirect,
            followAllRedirects: followRedirect
        });
    }

    post(path: string, object?: any, followRedirects?: boolean): Promise<HttpResult> {
        return this.request({
            method: "post",
            url: url.resolve(this.baseUrl, path),
            headers: this.headers,
            json: object,
            followRedirect: followRedirects,
            followAllRedirects: followRedirects
        });
    }

    patch(path: string, object?: any, followRedirects?: boolean): Promise<HttpResult> {
        return this.request({
            method: "patch",
            url: url.resolve(this.baseUrl, path),
            headers: this.headers,
            json: object,
            followRedirect: followRedirects,
            followAllRedirects: followRedirects
        });
    }

    delete(path: string, followRedirects?: boolean): Promise<HttpResult> {
        return this.request({
            method: "delete",
            url: url.resolve(this.baseUrl, path),
            headers: this.headers,
            followRedirect: followRedirects,
            followAllRedirects: followRedirects
        });
    }

    postForm(path: string, object?: any, followAllRedirects?: boolean): Promise<HttpResult> {
        return this.request({
            method: "post",
            url: url.resolve(this.baseUrl, path),
            form: object,
            followAllRedirects: followAllRedirects
        });
    }

    request(options: OptionsWithUrl): Promise<HttpResult> {
        return new Promise((resolve, reject) => {
            options.headers = this.headers;
            request(options, function (err, response, body) {
                if (err) {
                    reject(err);
                } else {
                    if (typeof body == "string" && /json/i.test(response.headers["content-type"])) {
                        body = JSON.parse(body);
                    }

                    let result = {
                        response: response,
                        body: body
                    };

                    resolve(result);
                }
            })
        });
    }
}