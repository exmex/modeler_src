import { BSONDocument } from "./BSONDocument";
import { v4 as uuidv4 } from "uuid";

export class BSONField {
    public id: string;
    public name: string;
    public rootDocument: boolean;
    public datatypes: Set<string> = new Set();
    public arrayDatatypes: Set<string> = new Set();
    public subDocument?: BSONDocument;

    public constructor(name: string, rootDocument: boolean) {
        this.name = name;
        this.id = uuidv4();
        this.rootDocument = rootDocument;
    }

    public any(): string {
        if (this.datatypes.size > 1 && this.arrayDatatypes.size === 0) {
            return [...this.datatypes].map(datatype => `"${datatype}"`).join(",");
        }
        if (((this.datatypes.size === 1 && this.datatypes.values().next().value === "array")
            && this.arrayDatatypes.size > 1)) {
            return [...this.arrayDatatypes, "array"].map(datatype => `"${datatype}"`).join(",");
        }
        if (((this.datatypes.size === 0 ||
            (this.datatypes.size === 1 && this.datatypes.values().next().value === "array"))
            && this.arrayDatatypes.size > 1)) {
            return [...this.arrayDatatypes].map(datatype => `"${datatype}"`).join(",");
        }
        if (this.datatypes.size > 1 && this.arrayDatatypes.size > 1) {
            return [...this.datatypes, "array"].map(datatype => `"${datatype}"`).join(",");
        }
        return "";
    }

    public defaultDatatype(): string {
        if (this.datatypes.size === 1 && this.arrayDatatypes.size === 0) {
            return this.datatypes.values().next().value;
        }

        if (this.isList()) {
            if (this.datatypes.size === 0 && this.arrayDatatypes.size > 1) {
                return "any";
            }
            return this.arrayDatatypes.values().next().value;
        }

        if (this.datatypes.size === 0 && this.arrayDatatypes.size > 1) {
            return "array";
        }

        if ((this.datatypes.size > 1 || this.arrayDatatypes.size > 1)
            || (this.datatypes.size > 1 && this.arrayDatatypes.size === 0)) {
            return "any";
        }

        return "object";
    }

    public isList(): boolean {
        return (this.datatypes.size === 0 && this.arrayDatatypes.size === 1) ||
            (this.datatypes.size === 0 && this.arrayDatatypes.size > 1);
    }

    public isNotNull(): boolean {
        if (this.isList()) {
            return !(this.arrayDatatypes.has("null") || this.arrayDatatypes.has("undefined"));
        }

        return !(this.datatypes.has("null") || this.datatypes.has("undefined"));
    }

    public isPk(): boolean {
        return ((this.name === "_id") && this.rootDocument);
    }

}
