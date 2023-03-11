import { ValidationParser } from "../ValidationParser";

export class NestedValidatorProvider {
    constructor(private schema: any) { }
    public provide(): string {
        return new ValidationParser(
            {
                ...this.schema,
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
}