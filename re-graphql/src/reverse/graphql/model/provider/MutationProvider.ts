import { GraphQLSchemaParser, Type } from "../../../../db/graphql/GraphQLSchemaParser";
import { OtherObject, OtherObjects } from "common";

import { ModelPartProvider } from "re";
import { v4 as uuidv4 } from "uuid";

const MUTATION = "Mutation";

export class MutationProvider implements ModelPartProvider<OtherObjects>{
    private parser: GraphQLSchemaParser;

    public constructor(parser: GraphQLSchemaParser) {
        this.parser = parser;
    }

    public async provide(): Promise<OtherObjects> {
        const result: OtherObjects = {};
        this.parser.getTypes().filter(typ => this.isMutation(typ)).forEach((typ): void => {
            const query = this.createMutation(
                uuidv4(),
                typ.name,
                typ.code,
                typ.description
            );
            result[query.id] = query;
        });
        return result;
    }

    private isMutation(typ: Type): boolean {
        return typ.name === MUTATION;
    }

    private createMutation(id: string, name: string, code: string, description: string): OtherObject {
        return {
            id,
            visible: true,
            name: name,
            desc: description,
            type: "Mutation",
            code,
            lines: [],
            generate: true,
            generateCustomCode: true
        }
    }
}
