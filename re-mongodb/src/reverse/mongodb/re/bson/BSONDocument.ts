import {v4 as uuidv4} from "uuid";

import { BSONField } from "./BSONField";

export class BSONDocument {
    public id: string;
    public name: string;
    public fields: Map<string, BSONField> = new Map();
    public root: boolean;

    public constructor(name: string, root: boolean) {
        this.name = name;
        this.id = uuidv4();
        this.root = root;
    }

    public findOrCreateField(key: string): BSONField {
        let field = this.fields.get(key);
        if (!field) {
            field = new BSONField(key, this.root);
            this.fields.set(key, field);
        }
        return field;
    }
}
