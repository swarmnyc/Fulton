import { entity, column, objectIdColumn, ObjectId } from 'fulton-server';

/**
 * see http://typeorm.io/#/entities for more information
 */
@entity("${dbTableName}"${dbConn == "default" ? "" : ', "' + dbConn + '"' })
export class ${className} {
    @objectIdColumn()
    id: ObjectId;

    @column()
    name: string;
}