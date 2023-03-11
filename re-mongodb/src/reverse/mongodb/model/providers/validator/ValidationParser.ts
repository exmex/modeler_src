export class ValidationParser {
    constructor(private schema: any) { }

    public parse(): string {
        return this.schema && Object
            .keys(this.schema)
            .filter(key => this.schema[key] != undefined)
            .map(key => `${key}: ${JSON.stringify(this.schema[key])}`)
            .join(",\n");
    }
}