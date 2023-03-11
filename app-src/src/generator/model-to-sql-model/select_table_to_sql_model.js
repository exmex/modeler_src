import { ScopeType } from "./sql_model_builder";
import { ToSQLModel } from "./to_sql_model";

const KEYWORDS = {
  FROM: `FROM`,
  SELECT: `SELECT`
};

/**
 * Convert model to SQL model
 * SELECT TABLE
 */
export class SelectTableToSQLModel extends ToSQLModel {
  constructor(sqlModelBuilder, finder, generatorOptions, table) {
    super(sqlModelBuilder, finder, generatorOptions);
    this.table = table;
  }

  convert() {
    return this.sb.statements(
      this.sb.statement(
        this.sb.keyword(KEYWORDS.SELECT),
        this.sb.list(
          ...this.table.cols.map((col) =>
            this.sb.identifier(col.name, false, ScopeType.SUBOBJECT)
          )
        ),
        this.sb.block(
          this.sb.keyword(KEYWORDS.FROM),
          this.sb.qualifiedIdentifier(this.table)
        ),
        this.sb.statementDelimiter(false)
      )
    );
  }
}
