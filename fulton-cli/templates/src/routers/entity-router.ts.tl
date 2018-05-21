import { ${entityName} } from '../entities/${entityFileName}';
import { entityRouter, EntityRouter, Request, Response } from 'fulton-server';

@entityRouter("/${routerPath}", ${entityName})
export class ${className} extends EntityRouter<${entityName}> {
}
