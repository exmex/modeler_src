import { JSONDatatypeResolver, JSONType } from "./JSONDatatypeResolver";
import { JSONDocument } from "./triage/JSONDocument";
import { JSONField } from "./triage/JSONField";

export class JSONDocumentParser {
    public parseDocument(obj: JSONType, doc: JSONDocument): void {
        if (!obj) {
            return;
        }
        Object.keys(obj).forEach((key: string): void => {
            const field = this.findOrCreateField(doc, key);
            const datatype = JSONDatatypeResolver.getDataType(obj[key]);

            if (datatype === "array") {
                const array: [] = obj[key] as [];
                array.forEach((item): void => {
                    const innerDatatype = JSONDatatypeResolver.getDataType(item);
                    if (innerDatatype !== "array") {
                        field.arrayDatatypes.add(innerDatatype);

                        if (innerDatatype === "object") {
                            if (!field.subDocument) {
                                field.subDocument = new JSONDocument(`${doc.name}.${key}`);
                            }
                            this.parseDocument(item, field.subDocument);
                        }
                    } else {
                        field.datatypes.add("array");
                    }
                });
            } else {
                field.datatypes.add(datatype);
                if ((datatype === "object") && (obj[key] !== undefined)) {
                    if (!field.subDocument) {
                        field.subDocument = new JSONDocument(`${doc.name}.${key}`);
                    }
                    this.parseDocument(obj[key] as JSONType, field.subDocument);
                }
            }
        });
    }

    private findOrCreateField(doc: JSONDocument, key: string): JSONField {
        let field = doc.fields.get(key);
        if (!field) {
            field = new JSONField(key);
            doc.fields.set(key, field);
        }
        return field;
    }
}
