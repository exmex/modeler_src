export interface JSONType {
    [key: string]: JSONFieldType;
}

export type JSONFieldType = string | number | null | boolean | symbol | object | undefined | object[];

export class JSONDatatypeResolver {
    public static getDataType(value: JSONFieldType): string {
        // string
        if (typeof value === "string" || value instanceof String) {
            return "string";
        }

        // number
        if (typeof value === "number" && isFinite(value)) {
            return "number";
        }

        // array
        if (Array.isArray(value)) {
            return "array";
        }

        // null
        if (value === null) {
            return "null";
        }

        // undefined
        if (typeof value === "undefined") {
            return "undefined";
        }

        // boolean
        if (typeof value === "boolean") {
            return "boolean";
        }

        // date
        if (value instanceof Date) {
            return "date";
        }

        // symbol
        if (typeof value === "symbol") {
            return "symbol";
        }

        // Object
        return "object";
    }
}
