import {
  Column,
  DiagramItem,
  ItemObject,
  Line,
  MoonModelerModel,
  OtherObjects,
  Relation,
  Table,
  Tables
} from "common";

import { CombinedModel } from "../CombinedModel";
import { CombinedModelLoader } from "../../source/CombinedModelLoader";
import { Edge } from "../Edge";
import { MMEdge } from "./MMEdge";
import { MMVertice } from "./MMVertice";
import { Vertice } from "../Vertice";
import _ from "lodash";

interface ItemWithType {
  item: ItemObject;
  type: string;
}
export class MoonModelerCombinedModelLoader extends CombinedModelLoader<MoonModelerModel> {
  protected createModel(
    modelData: MoonModelerModel,
    vertices: Vertice[],
    edges: Edge[]
  ): CombinedModel<MoonModelerModel> {
    return new CombinedModel(
      modelData,
      vertices,
      edges,
      modelData.layoutUpdateDiagrams?.[this.diagramId]?.start ?? {
        x: 0,
        y: 0
      }
    );
  }

  protected loadEdges(
    modelData: MoonModelerModel,
    vertices: MMVertice[]
  ): Edge[] {
    const relations = modelData.relations;
    const relationObjects = Object.keys(relations)
      .map((key): Relation => relations[key])
      .reduce<Edge[]>((result, relation): Edge[] => {
        const edge = this.createEdge(relation, vertices);
        return edge ? [...result, edge] : result;
      }, []);

    const lines = modelData.lines;
    const lineObjects = Object.keys(lines)
      .map((key): Line => lines[key])
      .reduce<Edge[]>((result, line): Edge[] => {
        const edge = this.createLine(line, vertices);
        return edge ? [...result, edge] : result;
      }, []);
    return [...relationObjects, ...lineObjects];
  }

  private getItem(
    modelData: MoonModelerModel,
    id: string
  ): ItemWithType | undefined {
    if (modelData.tables[id]) {
      return { item: modelData.tables[id], type: "table" };
    }
    if (modelData.notes[id]) {
      return { item: modelData.notes[id], type: "note" };
    }
    if (modelData.otherObjects[id]) {
      return { item: modelData.otherObjects[id], type: "otherObject" };
    }
    return undefined;
  }

  private buildCols(table: Table) {
    return table.cols.map((col: Column): string => col.id);
  }

  private buildAllCols(
    modelData: MoonModelerModel,
    table: Table,
    diagramId: string
  ) {
    return [
      {
        offset: 0,
        name: table.name,
        type: "",
        param: "",
        isCaption: true
      },
      ...this.getAllCols(
        modelData.tables,
        table,
        0,
        modelData.otherObjects,
        {},
        diagramId,
        modelData
      )
    ];
  }

  private createMMVertice(
    modelData: MoonModelerModel,
    diagramItem: DiagramItem,
    itemWithType: ItemWithType,
    diagramId: string
  ): MMVertice {
    const cols =
      itemWithType.type === "table"
        ? this.buildCols(itemWithType.item as Table)
        : [];
    const allCols =
      itemWithType.type === "table"
        ? this.buildAllCols(modelData, itemWithType.item as Table, diagramId)
        : [
            {
              offset: 0,
              name: itemWithType.item.name,
              type: "",
              param: "",
              isCaption: true
            }
          ];

    return new MMVertice(
      diagramItem.referencedItemId,
      itemWithType.item ? itemWithType.item.name : "",
      diagramItem.x,
      diagramItem.y,
      diagramItem.gWidth,
      diagramItem.gHeight,
      cols,
      allCols
    );
  }

  protected loadVertices(modelData: MoonModelerModel): Vertice[] {
    const diagram = modelData.diagrams[this.diagramId];
    const diagramItems = modelData.diagrams[this.diagramId].diagramItems;

    return Object.keys(diagramItems).reduce<MMVertice[]>(
      (result, referencedItemId) => {
        const itemWithType = this.getItem(modelData, referencedItemId);
        const filter = modelData.layoutUpdateDiagrams?.[this.diagramId];
        const isItemInFilter =
          !filter ||
          !!_.find(filter.ids, (ids) => ids.includes(itemWithType.item.id));
        if (
          itemWithType &&
          ((diagram.main === true &&
            itemWithType.item.visible &&
            isItemInFilter) ||
            diagram.main === false)
        ) {
          return [
            ...result,
            this.createMMVertice(
              modelData,
              diagramItems[referencedItemId],
              itemWithType,
              diagram.id
            )
          ];
        }
        return result;
      },
      []
    );
  }

  private getAllCols(
    tables: Tables,
    table: Table,
    offset: number,
    otherObjects: OtherObjects,
    visited: Tables,
    diagramId: string,
    modelData: MoonModelerModel
  ): {
    offset: number;
    name: string;
    type: string;
    param: string;
    isCaption: boolean;
  }[] {
    const result = [];
    for (const col of table.cols) {
      if (!col.isHidden && !visited[table.id]) {
        let nested = tables[col.datatype];
        const collapsed =
          modelData.diagrams[diagramId].diagramItems[col.datatype]
            ?.collapsed === true;
        if (nested && this.expandNested && nested.embeddable && !collapsed) {
          const innerVisited = { ...visited, [table.id]: table };

          result.push({
            offset: offset + 1,
            name: col.name,
            type: "",
            param: "",
            isCaption: true
          });

          this.getAllCols(
            tables,
            nested,
            offset + 1,
            otherObjects,
            innerVisited,
            diagramId,
            modelData
          ).forEach((i) => result.push(i));
        }
        result.push({
          offset,
          name: col.name,
          type: this.type(nested, col.datatype, otherObjects),
          param: col.param,
          isCaption: false
        });
      }
    }
    return result;
  }

  private type(
    nested: Table | undefined,
    dt: string,
    otherObjects: OtherObjects
  ) {
    if (nested) {
      return nested.name;
    }
    if (otherObjects[dt]) {
      return otherObjects[dt].name;
    }
    return dt;
  }

  private createLine(line: Line, vertices: MMVertice[]): Edge | undefined {
    const parentVertice = this.findVertice(vertices, line.parent);
    if (!parentVertice) {
      return undefined;
    }
    const childVertice = this.findVertice(vertices, line.child);
    if (!childVertice) {
      return undefined;
    }

    const edge = new MMEdge(parentVertice, childVertice, 0, 0);

    if (parentVertice === childVertice) {
      parentVertice.edges.push(edge);
    } else {
      parentVertice.edges.push(edge);
      childVertice.edges.push(edge);
    }

    return edge;
  }

  private createEdge(
    relation: Relation,
    vertices: MMVertice[]
  ): Edge | undefined {
    const parentVertice = this.findVertice(vertices, relation.parent);
    if (!parentVertice) {
      return undefined;
    }
    const childVertice = this.findVertice(vertices, relation.child);
    if (!childVertice) {
      return undefined;
    }

    const parentChildCol = relation.cols.find((): boolean => true);
    if (!parentChildCol) {
      return undefined;
    }
    const parentColIndex = parentVertice.cols.indexOf(parentChildCol.parentcol);
    const childColIndex = childVertice.cols.indexOf(parentChildCol.childcol);

    const edge = new MMEdge(
      parentVertice,
      childVertice,
      parentColIndex,
      childColIndex
    );

    if (parentVertice === childVertice) {
      parentVertice.edges.push(edge);
    } else {
      parentVertice.edges.push(edge);
      childVertice.edges.push(edge);
    }

    return edge;
  }

  private findVertice(
    vertices: MMVertice[],
    verticeId: string
  ): MMVertice | undefined {
    return vertices.find((item): boolean => item.id === verticeId);
  }
}
