import { BaseOptions } from './options';
import { Env } from '../helpers';
import { Middleware, PathIdentifier } from '../interfaces';
import { InfoObject } from '@loopback/openapi-spec';

export class DocOptions extends BaseOptions<DocOptions> {
    /**
     * if true, app will enable docs.
     * the default value is false
     * It can be overridden by process.env["{appName}.options.docs.enabled]
     */
    enabled?: boolean = false;

    /**
     * the path for docs
     * the default value is /docs
     */
    path?: PathIdentifier = "/docs";

    /** 
     * the access key for the docs, if provided, to access the docs needs key on the url
     * for example `http://localhost:3000/docs?key=the-key`
     * the default value is empty
    */
    accessKey?: string;

    /**
     * use the specific swagger format json file, if you don't want to use Fulton generate docs
     * the default value is empty
     */
    docsFilePath?: string;

    /**        
     * the information of the app. default values are from package.json
     */
    info?: InfoObject;

    init?(appName: string): void {
        this.enabled = Env.getBoolean(`${appName}.options.docs.enabled`, this.enabled);

        if (this.info == null) {
            // TODO: get more information
            let info = require(global.process.cwd() + "/package.json");

            this.info = {
                title: info.displayName || info.name,
                description: info.description,
                version: info.version
            }
        }
    }
}