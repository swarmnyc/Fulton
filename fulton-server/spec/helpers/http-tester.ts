import * as request from 'request';
import { FultonApp } from '../../src/index';
import * as url from 'url';
import { ResponseRequest, RequiredUriUrl, OptionsWithUrl, Headers } from 'request';
import FultonLog from '../../src/fulton-log';

export interface Result {
    response?: ResponseRequest;
    body?: any;
}

export class HttpTester {
    private baseUrl: string;

    headers: Headers;

    constructor(private app: FultonApp) {
        FultonLog.level = "warn";
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

    get(path: string, queryString?: any): Promise<Result> {
        return this.request({
            method: "get",
            url: url.resolve(this.baseUrl, path),
            qs: queryString
        });
    }

    postJson(path: string, object?: any): Promise<Result> {
        return this.request({
            method: "post",
            url: url.resolve(this.baseUrl, path),
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
                    if (response.statusCode >= 400) {
                        reject(new Error(`${response.statusCode} ${response.statusMessage}`));
                    } else {
                        let result: any = {
                            response: response,
                            body: body
                        };

                        resolve(result);
                    }
                }
            })
        });
    }
}