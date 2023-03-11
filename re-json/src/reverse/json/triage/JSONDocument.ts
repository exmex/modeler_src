import { JSONField } from "./JSONField";

export class JSONDocument {
    public name: string;
    public fields: Map<string, JSONField> = new Map();

    public constructor(name: string) {
        this.name = name;
    }
}
