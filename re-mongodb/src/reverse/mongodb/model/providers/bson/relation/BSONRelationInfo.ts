import { BSONDocument } from "../../../../re/bson/BSONDocument";
import { BSONField } from "../../../../re/bson/BSONField";

export class BSONRelationInfo {
    public parentCollection: string;
    public childDocument: BSONDocument;
    public childField: BSONField;

    public constructor(parentCollection: string, childDocument: BSONDocument, childField: BSONField) {
        this.parentCollection = parentCollection;
        this.childDocument = childDocument;
        this.childField = childField;
    }

    public equals(item: BSONRelationInfo): boolean {
        if (item == null) {
            return false;
        }

        return (item.childDocument)
            && (this.childDocument)
            && (item.childField)
            && (this.childField)
            && (item.parentCollection === this.parentCollection)
            && (item.childDocument.id === this.childDocument.id)
            && (item.childField.id === this.childField.id);
    }
}
