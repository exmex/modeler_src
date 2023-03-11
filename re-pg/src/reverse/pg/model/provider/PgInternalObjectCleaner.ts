import { OtherObject, OtherObjects } from "common";

import { SequenceRegistry } from "../../SequenceRegistry";

export class PgInternalObjectCleaner {
    public constructor(private sequenceRegistry: SequenceRegistry) { }
    public cleanup(otherObjects: OtherObjects): OtherObjects {
        const internalRangeFunctionNames = this.getRangeTypes(otherObjects);

        return Object
            .keys(otherObjects)
            .map((key) => otherObjects[key])
            .filter((obj) => this.filterInternalObjects(obj, internalRangeFunctionNames))
            .filter((obj) => !this.sequenceRegistry.isSuppressedSequence(obj))
            .reduce<OtherObjects>((r, i) => ({ ...r, [i.id]: i }), {});
    }

    private getRangeTypes(otherObjects: OtherObjects): string[] {
        return Object
            .keys(otherObjects)
            .map((key) => otherObjects[key])
            .filter((obj) => obj.pg && obj.pg.type === "range")
            .map((item) => `${item.name}`);
    }

    private filterInternalObjects(obj: OtherObject, internalRangeFunctionNames: string[]): unknown {
        return this.filterRangeConstructor(obj, internalRangeFunctionNames) && this.filterInternalArrayType(obj);
    }

    private filterRangeConstructor(obj: OtherObject, internalRangeFunctionNames: string[]) {
        return !((obj.type === "Procedure"
            || obj.type === "Function")
            && (internalRangeFunctionNames.find((name) => name === obj.name))
        );
    }

    private filterInternalArrayType(obj: OtherObject): unknown {
        return (((obj.pg && obj.pg.type !== "base") || !obj.pg) || (obj.pg && obj.pg.type === "base" && !obj.name.startsWith("_")));
    }
}