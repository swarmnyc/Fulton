import * as request from 'request';
import { FultonApp } from '../../src/index';
import * as url from 'url';
import { RequiredUriUrl, OptionsWithUrl, Headers } from 'request';
import FultonLog from '../../src/fulton-log';
import { ClientResponse } from 'http';

export interface Result {
    response?: ClientResponse;
    body?: any;
}

export class HttpTester {
    private baseUrl: string;

    private headers: Headers;

    constructor(private app: FultonApp) {
        FultonLog.level = "warn";
        this.app.options.logging.httpLoggerEnabled = false;
        this.headers = {};
    }

    start(): Promise<void> {
        return this.app.start().then(() => {
            this.baseUrl = "http://localhost:" + this.app.options.server.httpPort;
        });
    }

    stop(): Promise<void> {
        return this.app.stop();
    }

    setHeaders(headers: Headers) {
        this.headers = headers;
    }

    get(path: string, queryString?: any): Promise<Result> {
        return this.request({
            method: "get",
            url: url.resolve(this.baseUrl, path),
            headers: this.headers,
            qs: queryString
        });
    }

    postJson(path: string, object?: any): Promise<Result> {
        return this.request({
            method: "post",
            url: url.resolve(this.baseUrl, path),
            headers: this.headers,
            json: object,
        });
    }

    postForm(path: string, object?: any): Promise<Result> {
        return this.request({
            method: "post",
            url: url.resolve(this.baseUrl, path),
            form: object,
        });
    }

    request(options: OptionsWithUrl): Promise<Result> {
        return new Promise((resolve, reject) => {
            options.headers = this.headers;
            request(options, function (err, response, body) {
                if (err) {
                    reject(err);
                } else {
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