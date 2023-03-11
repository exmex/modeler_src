import { JSONDocument } from "./triage/JSONDocument";
import { JSONTableColumn } from "./triage/JSONTableColumn";

export class JSONDocumentFactory {
    public createDocument(jsonColumn: JSONTableColumn): JSONDocument {
        return new JSONDocument(`${jsonColumn.tablename}.${jsonColumn.column.name}`)
    }
}

