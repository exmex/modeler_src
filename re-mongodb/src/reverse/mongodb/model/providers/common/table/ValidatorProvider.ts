import { Collection } from "../../../../../../db/mongodb/MongoDBHandledConnection";

interface Validator {
    validationLevel?: string;
    validationAction?: string;
}

export class ValidatorProvider {
    constructor(protected document: Collection) { }

    public provide(): Validator {
        const result: Validator = {};
        if (this.document.options.validationLevel) {
            result.validationLevel = this.document.options.validationLevel;
        }
        if (this.document.options.validationAction) {
            result.validationAction = this.document.options.validationAction;
        }
        return result;
    }
}
