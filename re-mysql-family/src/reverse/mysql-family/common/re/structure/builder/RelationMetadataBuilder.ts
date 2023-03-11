import { CommonColumnReferenceMetadata, KnownIdRegistry } from "re";

import { KeyMetadata } from "../../../metadata/KeyMetadata";
import { RelationMetadata } from "../../../metadata/RelationMetadata";
import { TableMetadata } from "../../../metadata/TableMetadata";
import { v4 as uuidv4 } from "uuid";

interface RelationMetadataRow {
  REFERENCED_TABLE_NAME: string;
  TABLE_NAME: string;
  CONSTRAINT_TYPE: string;
  COLUMN_NAME: string;
  REFERENCED_COLUMN_NAME: string;
  CONSTRAINT_NAME: string;
  DELETE_RULE: string;
  UPDATE_RULE: string;
  UNIQUE_CONSTRAINT_NAME: string;
}

export class RelationMetadataBuilder {
  public constructor(private knownIdRegistry: KnownIdRegistry) {}

  public transform(
    result: RelationMetadataRow[],
    tablesMetadata: Map<string, TableMetadata>,
    relationsMetadata: Map<string, RelationMetadata>
  ): void {
    result.forEach((row: RelationMetadataRow): void => {
      if (row.CONSTRAINT_TYPE === "FOREIGN KEY") {
        const parentTableMetadata = tablesMetadata.get(
          row.REFERENCED_TABLE_NAME
        );
        const childTableMetadata = tablesMetadata.get(row.TABLE_NAME);
        if (parentTableMetadata && childTableMetadata) {
          this.addForeignKey(
            parentTableMetadata,
            childTableMetadata,
            relationsMetadata,
            row
          );
        }
      }
    });
  }

  private addForeignKey(
    parentTableMetadata: TableMetadata,
    childTableMetadata: TableMetadata,
    relationsMetadata: Map<string, RelationMetadata>,
    row: RelationMetadataRow
  ): void {
    const relation = this.findOrCreateRelation(
      relationsMetadata,
      row,
      parentTableMetadata,
      childTableMetadata
    );
    if (relation) {
      this.addColumnToConstraint(
        parentTableMetadata,
        childTableMetadata,
        relation,
        row.COLUMN_NAME,
        row.REFERENCED_COLUMN_NAME
      );
    }
  }

  private addColumnToConstraint(
    parentTableMetadata: TableMetadata,
    childTableMetadata: TableMetadata,
    relation: RelationMetadata,
    columnName: string,
    referencedColumnName: string
  ): void {
    const childColumn = childTableMetadata.columns.find(
      (col) => col.name === columnName
    );
    if (!childColumn) {
      return;
    }
    if (!childColumn.nn) {
      relation.mandatoryChild = "false";
    }

    const parentColumn = parentTableMetadata.columns.find(
      (col) => col.name === referencedColumnName
    );
    if (!parentColumn) {
      return;
    }
    if (!parentColumn.nn) {
      relation.mandatoryParent = "false";
    }

    childColumn.fk = true;

    const relationColId = this.knownIdRegistry.getRelationColumnId(
      parentTableMetadata.database,
      parentTableMetadata.name,
      undefined,
      childTableMetadata.database,
      childTableMetadata.name,
      undefined,
      relation.name,
      referencedColumnName,
      columnName
    );

    relation.cols.push({
      id: relationColId,
      parentcol: parentTableMetadata.columns.find(
        (col) => col.name === referencedColumnName
      ).id,
      childcol: childColumn.id
    });
  }

  private findOrCreateRelation(
    relationsMetadata: Map<string, RelationMetadata>,
    row: RelationMetadataRow,
    parentTableMetadata: TableMetadata,
    childTableMetadata: TableMetadata
  ): RelationMetadata | undefined {
    try {
      let relation = relationsMetadata.get(row.CONSTRAINT_NAME);
      if (!relation) {
        const parentKey = this.findParentKey(
          parentTableMetadata,
          row.UNIQUE_CONSTRAINT_NAME
        );
        if (!parentKey) {
          throw new Error(
            `Parent Key ${row.UNIQUE_CONSTRAINT_NAME} of ${parentTableMetadata.name}-${childTableMetadata.name} has not been found.`
          );
        }
        const parentKeyId = parentKey.id;
        const parentId = parentTableMetadata.id;
        const childId = childTableMetadata.id;

        const mandatoryParent = "true";
        const mandatoryChild = "true";
        const cardinalityChild = "many";

        const originalRelation = this.knownIdRegistry.getRelation(
          parentTableMetadata.database,
          parentTableMetadata.name,
          undefined,
          childTableMetadata.database,
          childTableMetadata.name,
          undefined,
          row.CONSTRAINT_NAME
        );
        const id = originalRelation?.id ?? uuidv4();

        relation = new RelationMetadata(
          id,
          row.CONSTRAINT_NAME,
          parentKeyId,
          parentId,
          childId,
          row.DELETE_RULE,
          row.UPDATE_RULE,
          mandatoryParent,
          mandatoryChild,
          cardinalityChild,
          originalRelation?.c_cp ?? "",
          originalRelation?.c_cch ?? ""
        );
        parentTableMetadata.relations.push(relation.id);
        if (parentTableMetadata.id !== childTableMetadata.id) {
          childTableMetadata.relations.push(relation.id);
        }
        relationsMetadata.set(relation.name, relation);
      }
      return relation;
    } catch (error) {
      console.log(error);
    }
    return undefined;
  }

  private findParentKey(
    parentTableMetadata: TableMetadata,
    constraintName: string
  ): KeyMetadata | undefined {
    const parentKey = parentTableMetadata.keys.get(constraintName);
    if (!parentKey) {
      return this.findKeySameAsIndex(parentTableMetadata, constraintName);
    }
    return parentKey;
  }

  private findKeySameAsIndex(
    parentTableMetadata: TableMetadata,
    indexName: string
  ): KeyMetadata | undefined {
    const index = parentTableMetadata.indexes.get(indexName);
    return Array.from(parentTableMetadata.keys.values()).find((key) =>
      this.compareKeyAndIndexItemsArrays(key.cols, index.cols)
    );
  }

  private compareKeyAndIndexItemsArrays(
    cols1: CommonColumnReferenceMetadata[],
    cols2: CommonColumnReferenceMetadata[]
  ): boolean {
    if (cols1.length === cols2.length) {
      for (let i = 0; i < cols1.length; i++) {
        if (cols1[i].colid !== cols2[i].colid) {
          return false;
        }
      }
      return true;
    }
    return false;
  }
}
