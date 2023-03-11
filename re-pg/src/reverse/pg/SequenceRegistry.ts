import { OtherObject } from "common";

export class SequenceRegistry {
    private suppressed: { schema: string, tableName: string, columnName: string }[] = [];

    suppressSequence(schema: string, tableName: string, columnName: string) {
        this.suppressed.push({ schema, tableName, columnName });
    }

    isSuppressedSequence(otherObject: OtherObject): boolean {
        if (otherObject.type !== "Sequence") {
            return false;
        }
        return !!this.suppressed.find(item => {
            const schemaName = item.schema;
            const sequenceName = `${item.tableName}_${item.columnName}_seq`;
            return (otherObject.name === sequenceName && otherObject.pg?.schema === schemaName);
        });
    }
}