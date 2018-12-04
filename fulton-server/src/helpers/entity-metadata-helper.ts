import { Type } from "../interfaces";
import { EntityMetadata } from "typeorm/metadata/EntityMetadata";
import { Connection, getMetadataArgsStorage } from "typeorm";
import { ColumnMetadata } from "typeorm/metadata/ColumnMetadata";

interface EntityProcessedMetadata {
    raw?: EntityMetadata;
    hidedColumns?: ColumnMetadata[];
}

/**
 * Pre process typeorm metadata
 */
export class EntityMetadataHelper {
    private entities: Map<any, EntityProcessedMetadata> = new Map();

    constructor(conns: Connection[]) {
        for (const conn of conns) {
            for (const metadata of conn.entityMetadatas) {
                if (!this.entities.has(metadata.target)) {
                    let epm = {
                        raw: metadata
                    }

                    this.entities.set(metadata.target, epm);
                    this.process(epm)
                }
            }
        }
    }

    getHidedColumns(entity: Type) : ColumnMetadata[] {
        return this.entities.get(entity).hidedColumns;
    }

    private process(metadata: EntityProcessedMetadata) {
        metadata.hidedColumns = metadata.raw.columns.filter((m) => !m.isSelect)
    }
}