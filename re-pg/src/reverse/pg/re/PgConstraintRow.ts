import { QueryResultRow } from "pg";

export interface PgConstraintRow extends QueryResultRow {
    _constraintname: string;
    _constrainttype: string;
    _selfschema: string;
    _selftable: string;
    _selfcolumns: string[];
    _foreignschema: string;
    _foreigntable: string;
    _foreigncolumns: string[];
    _definition: string;
    _updatetype: string;
    _deletetype: string;
}
