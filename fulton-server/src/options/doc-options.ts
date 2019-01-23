import { InfoObject } from '@loopback/openapi-spec';
import { Env } from '../helpers';
import { PathIdentifier } from '../types';
import { BaseOptions } from './options';

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

    init?(): void {
        this.enabled = Env.getBoolean(`${this.appName}.options.docs.enabled`, this.enabled);
    }
}