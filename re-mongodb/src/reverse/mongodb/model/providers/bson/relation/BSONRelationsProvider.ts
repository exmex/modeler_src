import { ModelFinder, WarningsProvider } from "re";
import { Relation, Relations, Table } from "common";

import { BSONRelationInfo } from "./BSONRelationInfo";
import { BSONRelationRegistry } from "./BSONRelationRegistry";
import { RelationsProvider } from "../../common/relation/RelationsProvider";
import { v4 as uuidv4 } from "uuid";

export class BSONRelationsProvider implements RelationsProvider {
    public constructor(private relationRegistry: BSONRelationRegistry, private warningsProvider: WarningsProvider) {
    }

    public provide(modelFinder: ModelFinder): Relations {
        return this.convertRelationInfoToModelRelations(this.relationRegistry, modelFinder);
    }

    private convertRelationInfoToModelRelations(relationRegistry: BSONRelationRegistry, modelFinder: ModelFinder): Relations {
        const result: Relation[] = [];
        relationRegistry.relationInfos.forEach((relation: BSONRelationInfo): void => {
            const parentTable = modelFinder.findTable(relation.parentCollection);
            if (!parentTable) {
                this.warningsProvider.addWarning(
                    `Parent collection ${relation.parentCollection} has not been found (Field: ${relation.childDocument.name}.${relation.childField.name})`
                );
                return;
            }
            const parentTableIdColumn = modelFinder.findColumn(parentTable, "_id");
            const parentTablePK = modelFinder.findPk(relation.parentCollection);
            const childTable = modelFinder.findTableById(relation.childDocument.id);

            if (parentTable && parentTableIdColumn && parentTablePK && childTable) {

                const modelRelation = {
                    ...this.defaultRelationValues(),
                    child: childTable.id,
                    cols: [
                        {
                            childcol: relation.childField.id,
                            id: uuidv4(),
                            parentcol: parentTableIdColumn.id,
                        },
                    ],
                    id: uuidv4(),
                    name: `${parentTable.name}-${childTable.name}.${relation.childField.name}`,
                    parent: parentTable.id,
                    parent_key: parentTablePK.id,
                };

                result.push(modelRelation);

                this.updateTableRelations(parentTable, modelRelation.id);
                this.updateTableRelations(childTable, modelRelation.id);

                this.updateChildTableCol(childTable, relation.childField.id);
            }
        });
        return this.convertToModelRelations(result);

    }

    private updateChildTableCol(table: Table, colid: string): void {
        const col = table.cols.find((item): boolean => item.id === colid);
        if (!!col) {
            col.fk = true;
        }
    }

    private updateTableRelations(table: Table, id: string): void {
        if (!table.relations.find((item): boolean => item === id)) {
            table.relations.push(id);
        }
    }

    private convertToModelRelations(result: Relation[]): Relations {
        const modelRelations: { [key: string]: Relation } = {};
        result.forEach((relation: Relation): void => {
            modelRelations[relation.id] = relation;
        });
        return modelRelations;
    }

    private defaultRelationValues(): Relation {
        return {
            c_mch: "false",
            c_mp: "false",
            desc: "",
            type: "identifying",
            visible: true,
            c_p: "one",
            c_ch: "many",
            c_cp: "",
            c_cch: "",
            child: "",
            cols: [],
            id: "",
            name: "",
            parent: "",
            parent_key: "",
            ri_pd: "",
            ri_pu: "",
            generate: true,
            generateCustomCode: true,
        };
    }
}
