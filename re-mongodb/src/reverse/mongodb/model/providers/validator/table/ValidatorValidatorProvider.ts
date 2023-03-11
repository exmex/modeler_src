import { ValidatorProvider } from "../../common/table/ValidatorProvider";
import { ValidationParser } from "../ValidationParser";

interface Validator {
    validationLevel?: string;
    validationAction?: string;
    validation?: string;
}

export class ValidatorValidatorProvider extends ValidatorProvider {

    public provide(): Validator {

        const result: Validator = super.provide();
        if (this.document.options
            && this.document.options.validator
            && this.document.options.validator.$jsonSchema) {

            result.validation = new ValidationParser(
                {
                    ...this.document.options.validator.$jsonSchema,
                    bsonType: undefined,
                    type: undefined,
                    enum: undefined,
                    items: undefined,
                    properties: undefined,
                    title: undefined,
                    description: undefined,
                    patternProperties: undefined,
                    required: undefined,
                }).parse();
        }
        return result;
    }
}
