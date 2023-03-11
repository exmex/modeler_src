import { MySQLFamilyFeatures } from "../MySQLFamilyFeatures";
import { Query } from "../Query";
import { QueryExecutor } from "re";

export interface ViewRow {
    SECURITY_TYPE: string;
    TABLE_NAME: string;
    VIEW_DEFINITION: string;
    CHECK_OPTION: string;
    DEFINER: string;
    ALGORITHM: string;
}

export class ViewDbQuery implements Query<ViewRow[]> {
    public constructor(private queryExecutor: QueryExecutor, private schema: string, private features: MySQLFamilyFeatures) {
    }

    public async execute(): Promise<ViewRow[]> {
        return await this.queryExecutor.query(
            `SELECT
                TABLE_NAME,
                VIEW_DEFINITION,
                CHECK_OPTION,
                IS_UPDATABLE,
                DEFINER,
                SECURITY_TYPE,
                ${this.features.viewAlgorithm() === true ? `ALGORITHM` : `null as ALGORITHM`}
            FROM information_schema.views WHERE VIEW_DEFINITION <> '' AND TABLE_SCHEMA = ?`, [this.schema],
        );
    }
}
