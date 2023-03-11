import { DiagramItemColor, DiagramItemColorProvider } from "re";
import { OtherObject, Table } from "common"

export class GraphQLDiagramItemColorProvider implements DiagramItemColorProvider {
    public getTableColor(table: Table): DiagramItemColor {
        switch (table.objectType) {
            case "type": {
                return {
                    background: "#03a9f4",
                    color: "#ffffff"
                }
            }
            case "input": {
                return {
                    background: "#ff9800",
                    color: "#ffffff"
                }
            }
            case "union": {
                return {
                    background: "#3f51b5",
                    color: "#ffffff"
                }
            }
            case "interface":
            default: {
                return {
                    background: "#8bc34a",
                    color: "#ffffff"
                }
            }
        }
    }

    public getOtherObjectColor(otherObject: OtherObject): DiagramItemColor {
        switch (otherObject.type) {
            case "Enum": {
                return {
                    background: "#9c27b0",
                    color: "#eee"
                }
            }
            case "Mutation": {
                return {
                    background: "#607d8b",
                    color: "#eee"
                }
            }
            case "Query": {
                return {
                    background: "#795548",
                    color: "#eee"
                }
            }
            case "Scalar":
            default: {
                return {
                    background: "#000",
                    color: "#eee"
                }
            }
        }
    }
}
