import { BSONDocument } from "../../../../re/bson/BSONDocument";
import { CollectionNameProvider } from "../../common/table/CollectionNameProvider";

export class BSONCollectionNameProvider implements CollectionNameProvider {
    constructor(private document: BSONDocument) { }

    provide(): string {
        return this.document.name;
    }
}