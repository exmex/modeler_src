/* eslint-disable @typescript-eslint/no-explicit-any */
export class NestedDocumentStructureRegistry {
    private items: any[] = [];

    public register(nestedDocument: any): void {
        this.items.push(nestedDocument);
    }
    public provide(documents: any[]): any {
        documents.push(...this.items);
    }
}
