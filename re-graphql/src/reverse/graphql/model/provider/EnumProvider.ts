import { ModelPartProvider, NamesRegistry } from "re";
import { OtherObject, OtherObjects } from "common"

import { GraphQLSchemaParser } from "../../../../db/graphql/GraphQLSchemaParser";

export class EnumProvider implements ModelPartProvider<OtherObjects>{
    private parser: GraphQLSchemaParser;
    private namesRegistry: NamesRegistry;

    public constructor(parser: GraphQLSchemaParser, namesRegistry: NamesRegistry) {
        this.parser = parser;
        this.namesRegistry = namesRegistry;
    }


    public async provide(): Promise<OtherObjects> {
        const result: OtherObjects = {};
        this.parser.getEnums().forEach((enu): void => {
            const id = this.namesRegistry.registerName(enu.name);
            const newEnum = this.createEnum(
                id,
                enu.name,
                enu.values,
                enu.description,
                enu.directive,
            );
            result[newEnum.id] = newEnum;
            this.namesRegistry.registerOtherObject(newEnum)
        });
        return result;
    }

    private createEnum(id: string, name: string, values: string, desc: string, directive: string): OtherObject {
        this.namesRegistry.registerName(name);
        return {
            id,
            visible: true,
            name: name,
            desc,
            type: "Enum",
            code: "",
            lines: [],
            enumValues: values,
            directive,
            generate: true,
            generateCustomCode: true
        }
    }
}
