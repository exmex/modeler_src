import { DiagramItemColor, DiagramItemColorProvider } from "re";
import { OtherObject, Table } from "common";

export class MongoDBDiagramItemColorProvider
  implements DiagramItemColorProvider
{
  getTableColor(table: Table): DiagramItemColor {
    return {
      background: table.embeddable === true ? "#8bc34a" : "#03a9f4",
      color: "#ffffff"
    };
  }
  getOtherObjectColor(otherObject: OtherObject): DiagramItemColor {
    return {
      background: "#8bc34a",
      color: "#ffffff"
    };
  }
}
