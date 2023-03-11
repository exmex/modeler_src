import { MMEdge } from "./MMEdge";
import { Vertice } from "../Vertice";
import _ from "lodash";

export class MMVertice implements Vertice {
  public left: number;
  public top: number;
  public width: number;
  public height: number;

  public id: string;
  public name: string;
  public edges: MMEdge[] = [];
  public cols: string[];
  public allCols: {
    offset: number;
    name: string;
    type: string;
    param: string;
    isCaption: boolean;
  }[];

  public constructor(
    id: string,
    name: string,
    left: number,
    top: number,
    width: number,
    height: number,
    cols: string[],
    allCols: {
      offset: number;
      name: string;
      type: string;
      param: string;
      isCaption: boolean;
    }[]
  ) {
    this.id = id;
    this.name = name;
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
    this.cols = cols;
    this.allCols = allCols;
  }

  public autoSize(): void {
    const HEADER_HEIGHT = 27;
    const ROW_HEIGHT = 18;

    this.width = this.countWidth();
    this.height =
      HEADER_HEIGHT +
      _.reduce(this.allCols, (r, row) => r + (row.isCaption ? 0 : 1), 0) *
        ROW_HEIGHT;
  }

  private countWidth(): number {
    const x = this.allCols.reduce((r, col, index) => {
      if (!r[col.offset]) {
        return {
          ...r,
          [col.offset]: {
            ...(!col.isCaption ? { width: this.fieldWidth(col) } : {}),
            ...(col.isCaption ? { captionWidth: this.captionWidth(col) } : {})
          }
        };
      }
      return {
        ...r,
        [col.offset]: {
          ...r[col.offset],
          ...(!col.isCaption
            ? {
                width: Math.max(
                  this.fieldWidth(col),
                  r[col.offset].name?.length ?? 0
                )
              }
            : {}),
          ...(col.isCaption ? { captionWidth: this.captionWidth(col) } : {})
        }
      };
    }, {} as any);

    const y = _.map(x, (x) => x).reduce(
      (r: number, col: any, index: number) => {
        return (
          (index > 0 ? 40 : 0) +
          r +
          Math.max(col.captionWidth ?? 0, col.width ?? 0)
        );
      },
      0
    );

    return y;
  }

  private isUpperCase(text: string) {
    const res = _.isString(text) ? text.toUpperCase() === text : false;
    return res;
  }

  private captionWidth(col: any) {
    const TITLE_CHAR_WIDTH = 7.5;
    const DEFAULT_MARGIN = 150;
    return Math.max(col.name.length * TITLE_CHAR_WIDTH, DEFAULT_MARGIN);
  }

  private fieldWidth(col: any) {
    const CHAR_WIDTH = 5;
    const UPPER_CHAR_WIDTH = 7;
    const NESTED_MARGIN = 15;
    const ROW_MARGIN = 145;

    const offsetLength = col.offset * NESTED_MARGIN;
    const nameLength = col.name.length * CHAR_WIDTH;
    const typeLength = col.type
      ? this.isUpperCase(col.type)
        ? col.type.length * UPPER_CHAR_WIDTH
        : col.type.length * CHAR_WIDTH
      : 0;
    const paramLength =
      (col.param?.length ?? 0) !== 0
        ? ((col.param?.length ?? 0) + 2) * CHAR_WIDTH
        : 0;

    const rowWidth =
      ROW_MARGIN + offsetLength + nameLength + typeLength + paramLength;
    return rowWidth > 0 ? rowWidth : 0;
  }
}
