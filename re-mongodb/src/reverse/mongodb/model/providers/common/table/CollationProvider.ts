import { Collection } from "../../../../../../db/mongodb/MongoDBHandledConnection";

export class CollationProvider {
    constructor(private document: Collection) { }

    public provide(): string | undefined {
        if (this.document.options.collation) {
            return `${JSON.stringify(this.document.options.collation)}`;
        }
        return undefined;
    }
}
