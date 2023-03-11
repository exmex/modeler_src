import { IdProvider } from "../../common/table/IdProvider";
import { BSONDocument } from "../../../../re/bson/BSONDocument";

export class BSONIdProvider implements IdProvider {
    constructor(private document: BSONDocument) { }

    provide(): string {
        return this.document.id;
    }
}