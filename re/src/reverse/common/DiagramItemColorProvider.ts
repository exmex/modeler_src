import { OtherObject, Table } from "common";

export interface DiagramItemColor {
    color: string;
    background: string;
}

export interface DiagramItemColorProvider {
    getTableColor(table: Table): DiagramItemColor;
    getOtherObjectColor(otherObject: OtherObject): DiagramItemColor;
}