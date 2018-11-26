import { Request, IEntityService } from '../interfaces';
import { Service } from './service';
import { ClientSecurity } from '../entities/client-security';
import { EntityService } from '../entities/entity-service';

export class SecurityService extends Service {
    entityService: EntityService<ClientSecurity>
    fieldName: string
    onInit() {
        this.entityService = this.app.getEntityService(ClientSecurity) as EntityService<ClientSecurity>

        // the entity is ambiguity for different database, so it have to change metadata
        this.entityService.updateIdMetadata()

        this.fieldName = this.app.options.security.fieldName
    }

    async verify(req: Request): Promise<boolean> {
        let key = this.getKey(req)

        if (key == null) {
            return false
        }

        let result = await this.entityService.findOne({
            filter: {
                key: key,
                expiredAt: {
                    "$gt": new Date()
                }
            }
        })

        return result.data != null
    }

    getKey(req: Request): string {
        let key = req.query[this.fieldName]
        if (key == null) {
            key = req.header(`x-${this.fieldName}`)
        }

        return key;
    }
}