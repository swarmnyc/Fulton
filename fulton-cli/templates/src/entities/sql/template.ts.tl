import { entity, column, primaryGeneratedColumn } from 'fulton-server';

/**
 * see http://typeorm.io/#/entities for more information
 */
@entity("${dbTableName}"${dbConn == "default" ? "" : ', "' + dbConn + '"' })
export class ${className} {
    @primaryGeneratedColumn("uuid")
    id: string;

    @column()
    name: string;
}