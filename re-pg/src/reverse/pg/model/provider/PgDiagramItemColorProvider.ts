import { DiagramItemColor, DiagramItemColorProvider } from "re"
import { OtherObject, Table } from "common"

export class PgDiagramItemColorProvider implements DiagramItemColorProvider {
    getTableColor(table: Table): DiagramItemColor {
        if (table.objectType === "composite") {
            return {
                background: "#ff9800",
                color: "#ffffff",
            }
        }
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
            case "Policy": {
                return {
                    background: "#3f51b5",
                    color: "#eee",
                }
            }
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
            case "Rule": {
                return {
                    background: "#3f51b5",
                    color: "#eee",
                }
            }
            case "Sequence": {
                return {
                    color: "#eee",
                    background: "#9c27b0",
                }
            }
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
            case "MaterializedView": {
                return {
                    background: "#3f51b5",
                    color: "#eee"
                }
            }
            default: {
                return {
                    background: "#3f51b5",
                    color: "#eee"
                }
            }
        }
        throw new Error("Method not implemented.");
    }
}
