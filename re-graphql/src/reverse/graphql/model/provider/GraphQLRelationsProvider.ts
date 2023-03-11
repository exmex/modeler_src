import { Column, Relation, RelationCol, Relations, Table } from "common";
import { ModelPartProvider, NamesRegistry } from "re";

import { GraphQLSchemaParser } from "../../../../db/graphql/GraphQLSchemaParser";
import { v4 as uuidv4 } from "uuid";

export class GraphQLRelationsProvider implements ModelPartProvider<Relations> {
  private parser: GraphQLSchemaParser;
  private namesRegistry: NamesRegistry;

  public constructor(
    parser: GraphQLSchemaParser,
    namesRegistry: NamesRegistry
  ) {
    this.parser = parser;
    this.namesRegistry = namesRegistry;
  }

  public async provide(): Promise<Relations> {
    const result: Relations = {};
    this.updateTypeToInterfaceLinks(result);
    this.updateRefs(result);
    this.updateUnionToTypeLinks(result);
    return result;
  }

  private isColForwarded(child: Table, childCol: Column, result: Relations) {
    const identifyingRelations = child.relations
      .map((relId) => result[relId])
      .filter((rel) => rel?.type === "identifying");
    if (identifyingRelations.length > 0) {
      const identificationRelationWithChildColumn = identifyingRelations.filter(
        (rel) => !!rel.cols.find((colpair) => colpair.childcol === childCol.id)
      );
      return identificationRelationWithChildColumn.length > 0;
    }
    return false;
  }

  private updateRefs(result: Relations): void {
    this.namesRegistry.tables.forEach((child: Table): void => {
      child.cols.forEach((childCol): void => {
        if (!this.isColForwarded(child, childCol, result)) {
          const parent = this.namesRegistry.tableById(childCol.datatype);
          if (parent) {
            const parentCol = parent.cols[0];
            childCol.fk = true;
            childCol.ref = parent.name;
            const relation = this.createRelation(parent, child, "simple", [
              { parentcol: parentCol, childcol: childCol }
            ]);
            result[relation.id] = relation;
          }
        }
      });
    });
  }

  private updateTypeToInterfaceLinks(result: Relations): void {
    this.parser.getTypes().forEach((type): void => {
      type.interfaces.forEach((implementedInter): void => {
        const relation = this.createRelationAndMigrateFields(
          type.name,
          implementedInter
        );
        if (relation) {
          result[relation.id] = relation;
        }
      });
    });
  }

  private updateColumn(ref: string, col: Column): Column {
    col.fk = true;
    col.ref = ref;
    return col;
  }

  private createRelationAndMigrateFields(
    name: string,
    implementedInter: string
  ): Relation | undefined {
    const parent = this.namesRegistry.table(implementedInter);
    const child = this.namesRegistry.table(name);

    if (!child || !parent) {
      return undefined;
    }

    const newChildColumns = parent.cols
      .filter(
        (col): boolean =>
          !col.isHidden &&
          child &&
          child.cols &&
          child.cols.filter((c): boolean => c.name === col.name).length === 1
      )
      .map((col): { childcol: Column; parentcol: Column } => ({
        childcol: this.updateColumn(
          parent.name,
          child.cols.find((i): boolean => i.name === col.name) as Column
        ),
        parentcol: col
      }));

    const relation = this.createRelation(
      parent,
      child,
      "identifying",
      newChildColumns
    );
    return relation;
  }

  private updateUnionToTypeLinks(result: Relations): void {
    this.parser.getUnions().forEach((union): void => {
      union.types.forEach((refType): void => {
        const relation = this.createRelationToInternalId(union.name, refType);
        if (relation) {
          result[relation.id] = relation;
        }
      });
    });
  }

  private createRelationToInternalId(
    name: string,
    refType: string
  ): Relation | undefined {
    const parent = this.namesRegistry.table(refType);
    const child = this.namesRegistry.table(name);

    if (!parent || !child) {
      return undefined;
    }

    const childNewField = this.childNewField(parent.name, parent.id);
    child.cols.push(childNewField);
    return this.createRelation(parent, child, "simple", [
      { parentcol: parent.cols[0], childcol: childNewField }
    ]);
  }
  private childNewField(parentname: string, parentid: string): Column {
    return {
      id: uuidv4(),
      name: parentname,
      datatype: parentid,
      param: "",
      pk: false,
      nn: false,
      comment: "",
      defaultvalue: "",
      data: "",
      list: false,
      isHidden: false,
      isArrayItemNn: false,
      fk: true,
      ref: parentname,
      collation: "",
      enum: "",
      unsigned: false,
      zerofill: false,
      after: "",
      autoinc: false,
      charset: "",
      estimatedSize: ""
    };
  }
  private createRelation(
    parent: Table,
    child: Table,
    type: string,
    cols: { parentcol: Column; childcol: Column }[]
  ): Relation {
    const relation = {
      id: uuidv4(),
      visible: true,
      name: `${parent.name}-${child.name}`,
      desc: "",
      type,
      parent_key: parent.keys[0].id,
      parent: parent.id,
      child: child.id,
      c_mp: "true",
      c_mch: "true",
      cols: cols.map(
        (a: { parentcol: Column; childcol: Column }): RelationCol => ({
          id: uuidv4(),
          parentcol: a.parentcol.id,
          childcol: a.childcol.id
        })
      ),
      c_p: "one",
      c_ch: child.objectType === "union" ? "one" : "many",
      c_cp: "",
      c_cch: "",
      ri_pd: "",
      ri_pu: "",
      generate: true,
      generateCustomCode: true
    };

    parent.relations.push(relation.id);
    child.relations.push(relation.id);

    return relation;
  }
}
