import { Collection } from "../../../../../../db/mongodb/MongoDBHandledConnection";

export interface Capped {
    capped?: boolean;
    max?: number;
    size?: number;
}

export class CappedProvider {
    constructor(private document: Collection) { }

    public provide(): Capped {
        const result: Capped = {};
        if (this.document.options.capped) {
            result.capped = true;
        }
        if (this.document.options.max) {
            result.max = this.document.options.max;
        }
        if (this.document.options.size) {
            result.size = this.document.options.size;
        }
        return result;
    }
}
