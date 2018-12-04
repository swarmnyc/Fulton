import * as https from 'https';
import { Env } from '../helpers';
import { BaseOptions } from './options';

export class ServerOptions extends BaseOptions<ServerOptions> {
    /**
     * if true, start a http server
     * the default value is true
     * It can be overridden by env["{appName}.options.server.httpEnabled]
     */
    httpEnabled?: boolean = true;

    /**
     * if true, start a https server
     * the default value is false
     * It can be overridden by env["{appName}.options.server.httpsEnabled]
     */
    httpsEnabled?: boolean = false;

    /**
     * the port for http
     * the default value is 3000
     * It can be overridden by 
     * process.env.PORT or
     * process.env["{appName}.options.server.httpPort"]
     */
    httpPort?: number | string = 3000;

    /**
     * the port for https 
     * the default value is 443
     * It can be overridden by process.env["{appName}.options.server.httpsPort"]
     */
    httpsPort?: number | string = 443;

    /**
     * ssl options, must to provide if httpsEnabled is true.
     */
    sslOptions?: https.ServerOptions;

    /**
     * if true, app will start in cluster mode
     * the default value is false
     * It can be overridden by process.env["{appName}.options.server.clusterEnabled]
     */
    clusterEnabled?: boolean

    /**
     * the number of worker for cluster
     * the default value is 0, which will use the number of cup cores
     * It can be overridden by process.env["{appName}.options.server.clusterWorkerNumber]
     */
    clusterWorkerNumber?: number

    init?(): void {
        this.httpEnabled = Env.getBoolean(`${this.appName}.options.server.httpEnabled`, this.httpEnabled);
        this.httpsEnabled = Env.getBoolean(`${this.appName}.options.server.httpsEnabled`, this.httpsEnabled);

        this.httpPort = Env.get(`${this.appName}.options.server.httpPort`, process.env.PORT || this.httpPort as string);
        this.httpsPort = Env.get(`${this.appName}.options.server.httpsPort`, this.httpsPort as string);

        this.clusterEnabled = Env.getBoolean(`${this.appName}.options.server.clusterEnabled`, this.clusterEnabled);
        this.clusterWorkerNumber = Env.getInt(`${this.appName}.options.server.clusterWorkerNumber`, this.clusterWorkerNumber);
    }
}