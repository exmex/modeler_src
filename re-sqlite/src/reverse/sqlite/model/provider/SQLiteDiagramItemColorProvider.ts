import { DiagramItemColor, DiagramItemColorProvider } from "re"
import { OtherObject, Table } from "common"

export class SQLiteDiagramItemColorProvider implements DiagramItemColorProvider {
    getTableColor(table: Table): DiagramItemColor {
        if (table.embeddable === true) {
            return {
                background: "#8bc34a",
                color: "#ffffff",
            }
        }
        return {
            background: "#03a9f4",
            color: "#ffffff",
        }
    }

    getOtherObjectColor(otherObject: OtherObject): DiagramItemColor {
        switch (otherObject.type) {
            case "Trigger": {
                return {
                    color: "#eee",
                    background: "#9c27b0",
                }
            }
            case "View": {
                return {
                    background: "#3f51b5",
                    color: "#eee",
                }
            }
            default: {
                return {
                    background: "#3f51b5",
                    color: "#eee"
                }
            }
        }
    }
}
