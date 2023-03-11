import { JSONDocument } from "./JSONDocument";

export class JSONField {
    public name: string;
    public datatypes: Set<string> = new Set();
    public arrayDatatypes: Set<string> = new Set();
    public subDocument?: JSONDocument;

    public constructor(name: string) {
        this.name = name;
    }

    public defaultDatatype(): string {
        if (this.datatypes.size === 1 && this.arrayDatatypes.size === 0) {
            return this.datatypes.values().next().value;
        }

        if (this.isList()) {
            return this.arrayDatatypes.values().next().value;
        }

        if (this.datatypes.size === 0 && this.arrayDatatypes.size > 1) {
            return "array";
        }

        if (this.datatypes.size > 1 || this.arrayDatatypes.size > 1) {
            return "undefined";
        }

        return "object";
    }

    public isList(): boolean {
        return this.datatypes.size === 0 && this.arrayDatatypes.size === 1;
    }
}
