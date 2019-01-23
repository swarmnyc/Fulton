import { ClientSecurity } from '../entities/client-security';
import { EntityService } from '../entities/entity-service';
import { ISecurityService } from '../types';
import { Request } from '../alias';
import { Service } from './service';
import { OauthStrategyOptions } from "../identity/options/oauth-strategy-options";

export class SecurityService extends Service implements ISecurityService {
    entityService: EntityService<ClientSecurity>
    fieldName: string
    excludes: RegExp[]

    onInit() {
        this.entityService = this.app.getEntityService(ClientSecurity) as EntityService<ClientSecurity>

        // the entity is ambiguity for different database, so it have to change metadata
        this.entityService.updateIdMetadata()

        if (this.app.options.docs.enabled) {
            // add docs to excludes
            let docPath = this.app.options.docs.path
            let reg: RegExp

            let func = (path: string | RegExp) => {
                let match = "/?[a-z0-9-]+\.\\w{2,3}"
                if (typeof path == "string") {
                    return new RegExp(`${path}${match}`)
                } else if (path instanceof RegExp) {
                    return new RegExp(`${path.source}${match}`)
                }
            }

            if (docPath instanceof Array) {
                if (docPath.length > 0) {
                    let path = docPath[docPath.length - 1]
                    reg = func(path)
                }
            } else {
                reg = func(docPath)
            }

            if (reg) {
                this.app.options.security.excludes.push(reg)
            }
        }

        if (this.app.options.identity.enabled) {
            this.app.options.identity.strategies.forEach((strategy) => {
                if (strategy.options instanceof OauthStrategyOptions) {
                    if (strategy.options.enabled && strategy.options.callbackPath) {
                        this.app.options.security.excludes.push(new RegExp(strategy.options.callbackPath, "i"))
                    }
                }
            })
        }

        this.fieldName = this.app.options.security.fieldName
        this.excludes = this.app.options.security.excludes
    }

    async verify(req: Request): Promise<boolean> {
        // check excludes
        if (this.excludes && this.excludes.length > 0) {
            for (const reg of this.excludes) {
                if (reg.test(req.url)) {
                    return true
                }
            }
        }

        let key = this.getKey(req)

        if (key == null) {
            return false
        }

        // cache for 10 minutes if cache is enabled
        let date = new Date()
        date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), Math.floor(date.getMinutes() / 10) * 10)

        let data = await this.entityService.findOne({
            filter: {
                key: key,
                expiredAt: {
                    "$gt": date
                }
            },
            cache: true
        })

        return data != null
    }

    private getKey(req: Request): string {
        let key = req.query[this.fieldName]
        if (key == null) {
            key = req.header(`x-${this.fieldName}`)
        }

        return key;
    }
}