import { DescriptionProvider } from "../../common/table/DescriptionProvider";

export class ValidatorDescriptionProvider implements DescriptionProvider {
    constructor(private schema: any) { }

    provide(): string {
        return this.schema ? this.schema.description : "";
    }

}