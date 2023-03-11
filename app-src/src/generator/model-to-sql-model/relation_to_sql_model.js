import { BracketType, ScopeType } from "./sql_model_builder";

import { ObjectToSQLModel } from "./object_to_sql_model";

const KEYWORDS = {
  ADD: `ADD`,
  ALTER: `ALTER`,
  CONSTRAINT: `CONSTRAINT`,
  DELETE: `DELETE`,
  FOREIGN: `FOREIGN`,
  KEY: `KEY`,
  ON: `ON`,
  REFERENCES: `REFERENCES`,
  TABLE: `TABLE`,
  UPDATE: `UPDATE`
};

const NOT_DEFINED_RI = "na";

/**
 * Convert model to SQL model
 * ALTER TABLE or constraint
 */
export class RelationToSQLModel extends ObjectToSQLModel {
  constructor(sqlModelBuilder, finder, generationOptions, obj) {
    super(sqlModelBuilder, finder, generationOptions, obj);
    this.tables = finder.model.tables;
    this.relations = finder.model.relations;
  }

  foreignKeyBlock() {
    return this.sb.block(
      this.sb.keyword(KEYWORDS.FOREIGN),
      this.sb.keyword(KEYWORDS.KEY),
      this.refChildColumnsBlock(this.child),
      this.sb.block(
        this.sb.keyword(KEYWORDS.REFERENCES),
        this.sb.qualifiedIdentifier(this.parent),
        this.refParentColumnsBlock(this.parent)
      ),
      this.onDeleteBlock(),
      this.onUpdateBlock()
    );
  }

  get parent() {
    return this.tables[this.relation.parent];
  }

  get child() {
    return this.tables[this.relation.child];
  }

  get relation() {
    return this.obj;
  }

  statementDelimiter() {
    return this.sb.statementDelimiter(false);
  }

  objectStatements() {
    return [
      this.sb.statement(
        this.sb.keyword(KEYWORDS.ALTER),
        this.sb.keyword(KEYWORDS.TABLE),
        this.sb.qualifiedIdentifier(this.child),
        this.addConstraintBlock(),
        this.statementDelimiter()
      )
    ];
  }

  addConstraintBlock() {
    return this.sb.block(this.sb.keyword(KEYWORDS.ADD), ...this.constraint());
  }

  constraint() {
    return [
      ...(this.relation.name
        ? [
            this.sb.keyword(KEYWORDS.CONSTRAINT),
            this.sb.identifier(this.relation.name, false, ScopeType.SUBOBJECT)
          ]
        : []),
      this.foreignKeyBlock()
    ];
  }

  refChildColumnsBlock() {
    return this.sb.brackets(
      this.sb.list(
        ...this.relation.cols
          .map((relationColRef) =>
            Object.keys(this.child.cols)
              .map((key) => this.child.cols[key])
              .find((childcol) => relationColRef.childcol === childcol.id)
          )
          .filter((column) => !!column)
          .map((column) =>
            this.sb.identifier(column.name, false, ScopeType.SUBOBJECT)
          )
      ),
      false,
      BracketType.ROUND
    );
  }

  refParentColumnsBlock() {
    return this.sb.brackets(
      this.sb.list(
        ...this.relation.cols
          .map((relationColRef) =>
            Object.keys(this.parent.cols)
              .map((key) => this.parent.cols[key])
              .find((parentcol) => relationColRef.parentcol === parentcol.id)
          )
          .filter((column) => !!column)
          .map((column) =>
            this.sb.identifier(column.name, false, ScopeType.SUBOBJECT)
          )
      ),
      false,
      BracketType.ROUND
    );
  }

  onDeleteBlock() {
    return this.relation.ri_pd && this.relation.ri_pd !== NOT_DEFINED_RI
      ? this.sb.block(
          this.sb.keyword(KEYWORDS.ON),
          this.sb.keyword(KEYWORDS.DELETE),
          this.sb.literal(this.relation.ri_pd)
        )
      : undefined;
  }

  onUpdateBlock() {
    return this.relation.ri_pu && this.relation.ri_pu !== NOT_DEFINED_RI
      ? this.sb.block(
          this.sb.keyword(KEYWORDS.ON),
          this.sb.keyword(KEYWORDS.UPDATE),
          this.sb.literal(this.relation.ri_pu)
        )
      : undefined;
  }
}
