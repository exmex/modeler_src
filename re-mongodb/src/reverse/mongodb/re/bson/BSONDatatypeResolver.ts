export class BSONDatatypeResolver {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public static getDataType(value: any): string {

        // null
        if (value === null) {
            return "null";
        }

        // undefined
        if (typeof value === "undefined") {
            return "undefined";
        }

        // array
        if (Array.isArray(value)) {
            return "array";
        }

        if (value._bsontype !== undefined) {
            switch (value._bsontype) {
                case "DBRef": return "dbPointer";
                case "Binary": return "binData";
                case "ObjectID": return "objectId";
                case "Code": return "javascript";
                case "Timestamp": return "timestamp";
                case "Decimal128": return "decimal";
                case "MinKey": return "minKey";
                case "MaxKey": return "maxKey";
                default: return value._bsontype;
            }
        }

        // string
        if (typeof value === "string" || (value as unknown) instanceof String) {
            return "string";
        }

        // number or NAN
        if ((typeof value === "number" && Number.isFinite(value))
            || (typeof value === "number" && Number.isNaN(value))) {
            return "double";
        }

        // boolean
        if (typeof value === "boolean") {
            return "bool";
        }

        // date
        if (value instanceof Date) {
            return "date";
        }

        // regexp
        if (value instanceof RegExp) {
            return "regex";
        }

        // symbol
        if (typeof value === "symbol") {
            return "symbol";
        }

        // Object
        return "object";
    }
}
