import { GraphQLSchemaParser } from "./GraphQLSchemaParser";

export interface GraphQLSchemaParserProvider {
    parser: GraphQLSchemaParser;
}