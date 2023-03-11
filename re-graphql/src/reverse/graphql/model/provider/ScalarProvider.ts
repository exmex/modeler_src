import { ModelPartProvider, NamesRegistry } from "re";
import { OtherObject, OtherObjects } from "common";

import { GraphQLSchemaParser } from "../../../../db/graphql/GraphQLSchemaParser";

export class ScalarProvider implements ModelPartProvider<OtherObjects>{
    private parser: GraphQLSchemaParser;
    private namesRegistry: NamesRegistry;

    public constructor(parser: GraphQLSchemaParser, namesRegistry: NamesRegistry) {
        this.parser = parser;
        this.namesRegistry = namesRegistry;
    }

    public async provide(): Promise<OtherObjects> {
        const result: OtherObjects = {};
        this.parser.getScalar().forEach((scalar): void => {
            const id = this.namesRegistry.registerName(scalar.name);
            const newScalar = this.createScalar(
                id,
                scalar.name,
                scalar.code,
                scalar.directive
            );
            result[newScalar.id] = newScalar;
            this.namesRegistry.registerOtherObject(newScalar)
        });
        return result;
    }

    private createScalar(id: string, name: string, code: string, directive: string): OtherObject {
        return {
            id,
            visible: true,
            name: name,
            desc: "",
            type: "Scalar",
            code,
            lines: [],
            directive,
            generate: true,
            generateCustomCode: true
        }
    }
}
