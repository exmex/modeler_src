import { KnownIdRegistry, QueryExecutor } from "re";

import { CheckConstraintMetadataBuilder } from "./builder/CheckConstraintMetadataBuilder";
import { KeyMetadataBuilder } from "./builder/KeyMetadataBuilder";
import { MySQLFamilyFeatures } from "../../MySQLFamilyFeatures";
import { RelationCardinalityResolver } from "./RelationCardinalityResolver";
import { RelationMetadata } from "../../metadata/RelationMetadata";
import { RelationMetadataBuilder } from "./builder/RelationMetadataBuilder";
import { TableMetadata } from "../../metadata/TableMetadata";

export class ConstraintsRE {
  public constructor(
    private queryExecutor: QueryExecutor,
    private schema: string,
    private features: MySQLFamilyFeatures,
    private knownIdRegistry: KnownIdRegistry
  ) {}

  public async reverse(
    tablesMetadata: Map<string, TableMetadata>,
    relationsMetadata: Map<string, RelationMetadata>
  ): Promise<void> {
    const query = this.buildQuery(this.features.checkConstraint());
    const result = await this.queryExecutor.query(query, [this.schema]);

    const pkMetadataBuilder = new KeyMetadataBuilder(this.knownIdRegistry);
    pkMetadataBuilder.transform(result, tablesMetadata, true);

    const uniqueMetadataBuilder = new KeyMetadataBuilder(this.knownIdRegistry);
    uniqueMetadataBuilder.transform(result, tablesMetadata, false);

    const checkMetadataBuilder = new CheckConstraintMetadataBuilder();
    checkMetadataBuilder.transform(result, tablesMetadata);

    const relationMetadataBuilder = new RelationMetadataBuilder(
      this.knownIdRegistry
    );
    relationMetadataBuilder.transform(
      result,
      tablesMetadata,
      relationsMetadata
    );

    const relationCardinalityResolver = new RelationCardinalityResolver();
    relationCardinalityResolver.resolve(tablesMetadata, relationsMetadata);
  }

  private buildQuery(checkConstraint: boolean): string {
    return `SELECT * FROM (
      SELECT  
        tc.CONSTRAINT_TYPE AS CONSTRAINT_TYPE,
          tc.CONSTRAINT_SCHEMA AS CONSTRAINT_SCHEMA,
          tc.TABLE_NAME AS TABLE_NAME,
          tc.CONSTRAINT_NAME AS CONSTRAINT_NAME,
          kc.ORDINAL_POSITION,
          kc.COLUMN_NAME,
          null AS REFERENCED_TABLE_NAME,
          null AS REFERENCED_COLUMN_NAME,
          null AS UNIQUE_CONSTRAINT_NAME,
          null AS UPDATE_RULE,
          null AS DELETE_RULE,
          null AS CHECK_CLAUSE
      FROM 
        INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
        JOIN
          INFORMATION_SCHEMA.KEY_COLUMN_USAGE kc
          ON	tc.CONSTRAINT_CATALOG  = kc.CONSTRAINT_CATALOG
            AND tc.CONSTRAINT_SCHEMA  = kc.CONSTRAINT_SCHEMA 
            AND tc.CONSTRAINT_NAME = kc.CONSTRAINT_NAME 
            AND tc.TABLE_SCHEMA  = kc.TABLE_SCHEMA 
            AND tc.TABLE_NAME  = kc.TABLE_NAME
      WHERE 
        tc.CONSTRAINT_TYPE IN ('UNIQUE', 'PRIMARY KEY')
      UNION
      SELECT
          tc.CONSTRAINT_TYPE AS CONSTRAINT_TYPE,
          tc.CONSTRAINT_SCHEMA AS CONSTRAINT_SCHEMA,
          tc.TABLE_NAME AS TABLE_NAME,
          tc.CONSTRAINT_NAME AS CONSTRAINT_NAME,
          kcu.ORDINAL_POSITION,
          kcu.COLUMN_NAME AS COLUMN_NAME,
          kcu.REFERENCED_TABLE_NAME AS REFERENCED_TABLE_NAME,
          kcu.REFERENCED_COLUMN_NAME AS REFERENCED_COLUMN_NAME,
          rc.UNIQUE_CONSTRAINT_NAME AS UNIQUE_CONSTRAINT_NAME,
          rc.UPDATE_RULE AS UPDATE_RULE,
          rc.DELETE_RULE AS DELETE_RULE,
          null AS CHECK_CLAUSE
      FROM 
        INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
          JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
                ON kcu.CONSTRAINT_CATALOG = tc.CONSTRAINT_CATALOG
                AND kcu.CONSTRAINT_SCHEMA = tc.CONSTRAINT_SCHEMA
                AND kcu.CONSTRAINT_NAME = tc.CONSTRAINT_NAME
                AND kcu.TABLE_SCHEMA = tc.TABLE_SCHEMA
                AND kcu.TABLE_NAME = tc.TABLE_NAME
                AND (kcu.REFERENCED_TABLE_SCHEMA = tc.CONSTRAINT_SCHEMA
                OR kcu.REFERENCED_TABLE_SCHEMA IS NULL)
          JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc
                ON tc.CONSTRAINT_CATALOG = rc.CONSTRAINT_CATALOG
                AND tc.CONSTRAINT_SCHEMA = rc.CONSTRAINT_SCHEMA
                AND tc.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
                AND tc.CONSTRAINT_TYPE = 'FOREIGN KEY'
      WHERE 
        tc.CONSTRAINT_TYPE IN ('FOREIGN KEY')
      ${
        checkConstraint
          ? `
      UNION
      SELECT  
        tc.CONSTRAINT_TYPE AS CONSTRAINT_TYPE,
          tc.CONSTRAINT_SCHEMA AS CONSTRAINT_SCHEMA,
          tc.TABLE_NAME AS TABLE_NAME,
          tc.CONSTRAINT_NAME AS CONSTRAINT_NAME,
          null as ORDINAL_POSITION,
          null as COLUMN_NAME,
          null AS REFERENCED_TABLE_NAME,
          null AS REFERENCED_COLUMN_NAME,
          null AS UNIQUE_CONSTRAINT_NAME,
          null AS UPDATE_RULE,
          null AS DELETE_RULE,
          cc.CHECK_CLAUSE AS CHECK_CLAUSE
      FROM 
        INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
          JOIN INFORMATION_SCHEMA.CHECK_CONSTRAINTS cc
                ON tc.CONSTRAINT_CATALOG = cc.CONSTRAINT_CATALOG
                AND tc.CONSTRAINT_SCHEMA = cc.CONSTRAINT_SCHEMA
                AND tc.CONSTRAINT_NAME = cc.CONSTRAINT_NAME
                AND tc.CONSTRAINT_TYPE = 'CHECK'
      WHERE 
        tc.CONSTRAINT_TYPE IN ('CHECK')`
          : ``
      }
      ) result
      WHERE CONSTRAINT_SCHEMA = ?      
      ORDER BY CONSTRAINT_TYPE,CONSTRAINT_SCHEMA,TABLE_NAME,ORDINAL_POSITION`;
  }
}
