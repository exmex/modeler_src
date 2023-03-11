import { DiagramItemColor, DiagramItemColorProvider } from "re"
import { OtherObject, Table } from "common"

export class MySQLFamilyDiagramItemColorProvider implements DiagramItemColorProvider {

    getTableColor(table: Table): DiagramItemColor {
        return {
            background: table.embeddable === true ? "#8bc34a" : "#03a9f4",
            color: "#ffffff",
        }
    }

    getOtherObjectColor(otherObject: OtherObject): DiagramItemColor {
        switch (otherObject.type) {
            case "Function": {
                return {
                    background: "#607d8b",
                    color: "#eee",
                }
            }
            case "Procedure": {
                return {
                    background: "#795548",
                    color: "#eee",
                }
            }
            case "Trigger": {
                return {
                    color: "#eee",
                    background: "#9c27b0",
                }
            }
            case "View":
            default: {
                return {
                    background: "#3f51b5",
                    color: "#eee",
                }
            }
        }
    }
}
