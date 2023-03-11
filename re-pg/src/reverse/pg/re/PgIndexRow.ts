import { QueryResultRow } from "pg";

export interface PgIndexRow extends QueryResultRow {
    _index: {
        schema: string,
        name: string,
        unique: boolean,
        tablespace?: string,
        expression?: string;
        comment?: string;
        using?: string;
        storageParameters?: string[];
        columns: {
            name: string,
            asc: boolean,
            desc: boolean,
            nulls_first: boolean,
            nulls_last: boolean,
            collation?: string;
            expression?: string;
        }[]
    };
}
