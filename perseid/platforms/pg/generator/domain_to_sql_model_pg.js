import {
  BracketType,
  ScopeType
} from "../../../generator/model-to-sql-model/sql_model_builder";

import { ObjectToSQLModel } from "../../../generator/model-to-sql-model/object_to_sql_model";

export class DomainToSQLModelPG extends ObjectToSQLModel {
  get domain() {
    return this.obj;
  }

  parameterBlock(keyword, propertyName, identifier) {
    const parameter =
      identifier === true
        ? this.sb.identifier(
            this.domain.pg.domain[propertyName],
            true,
            ScopeType.SUBOBJECT
          )
        : this.sb.literal(this.domain.pg.domain[propertyName]);

    return this.domain.pg &&
      this.domain.pg.domain &&
      this.domain.pg.domain[propertyName]
      ? this.sb.block(this.sb.keyword(keyword), parameter)
      : undefined;
  }

  nullBlock() {
    return this.domain.pg &&
      this.domain.pg.domain &&
      this.domain.pg.domain.not_null
      ? this.sb.block(this.sb.keyword(`NOT`), this.sb.keyword(`NULL`))
      : this.sb.keyword(`NULL`);
  }

  constraintBlock(constraint) {
    return this.sb.block(
      constraint.name ? this.sb.keyword(`CONSTRAINT`) : undefined,
      constraint.name
        ? this.sb.identifier(constraint.name, false, ScopeType.SUBOBJECT)
        : undefined,
      this.sb.block(this.sb.code(constraint.constraint_def))
    );
  }

  constraints() {
    const constraints =
      this.domain.pg &&
      this.domain.pg.domain &&
      this.domain.pg.domain.constraints;
    if (constraints) {
      return constraints.map((constraint) => this.constraintBlock(constraint));
    }
    return [];
  }

  commentStatement() {
    return this.domain.desc
      ? this.sb.statement(
          //
          this.sb.keyword(`COMMENT`),
          this.sb.keyword(`ON`),
          this.sb.keyword(`DOMAIN`),
          this.sb.qualifiedIdentifier(this.domain),
          this.sb.keyword(`IS`),
          this.sb.quotedLiteral(this.domain.desc),
          this.sb.statementDelimiter(false)
        )
      : undefined;
  }

  objectStatements() {
    const domainDetails = this.domain.pg && this.domain.pg.domain;
    if (!domainDetails) {
      return undefined;
    }
    return [
      this.sb.statement(
        //
        this.sb.keyword(`CREATE`),
        this.sb.keyword(`DOMAIN`),
        this.sb.block(
          //
          this.sb.qualifiedIdentifier(this.domain),
          this.sb.literal(domainDetails.datatype),
          this.sb.brackets(
            //
            this.sb.literal(domainDetails.datatype_param),
            true,
            BracketType.ROUND
          )
        ),
        this.parameterBlock(`COLLATE`, `collation`, true),
        this.parameterBlock(`DEFAULT`, `default`, false),
        ...this.constraints(),
        this.nullBlock(),
        this.sb.statementDelimiter(false)
      ),
      this.commentStatement()
    ];
  }
}
