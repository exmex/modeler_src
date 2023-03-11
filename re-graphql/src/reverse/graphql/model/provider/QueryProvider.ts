import { GraphQLSchemaParser, Type } from "../../../../db/graphql/GraphQLSchemaParser";
import { OtherObject, OtherObjects } from "common";

import { ModelPartProvider } from "re";
import { v4 as uuidv4 } from "uuid";

const QUERY = "Query";
export class QueryProvider implements ModelPartProvider<OtherObjects>{
    private parser: GraphQLSchemaParser;

    public constructor(parser: GraphQLSchemaParser) {
        this.parser = parser;
    }

    public async provide(): Promise<OtherObjects> {
        const result: OtherObjects = {};
        this.parser.getTypes().filter(typ => this.isQuery(typ)).forEach((typ): void => {
            const query = this.createQuery(
                uuidv4(),
                typ.name,
                typ.code,
                typ.description
            );
            result[query.id] = query;
        });
        return result;
    }

    private isQuery(typ: Type): boolean {
        return typ.name === QUERY;
    }


    private createQuery(id: string, name: string, code: string, description: string): OtherObject {
        return {
            id,
            visible: true,
            name: name,
            desc: description,
            type: "Query",
            code,
            lines: [],
            generate: true,
            generateCustomCode: true
        }
    }
}
