import { HandledConnection, Platform } from "re";

import { GraphQLFeatures } from "./GraphQLFeatures";
import { GraphQLSchemaParser } from "./GraphQLSchemaParser";
import { GraphQLSchemaParserProvider } from "./GraphQLSchemaParserProvider";

export class GraphQLHandledConnection
  implements HandledConnection<GraphQLFeatures>, GraphQLSchemaParserProvider {
  public readonly parser: GraphQLSchemaParser;

  public constructor(parser: GraphQLSchemaParser) {
    this.parser = parser;
  }

  public async getServerPlarform(): Promise<Platform> {
    return Platform.GRAPHQL;
  }

  public getFeatures(): Promise<GraphQLFeatures> {
    return Promise.resolve(new GraphQLFeatures());
  }

  public async getServerVersion(): Promise<string> {
    return "";
  }

  public async getServerDescription(): Promise<string> {
    return "GraphQL";
  }

  public async close(): Promise<void> {
    // abstract
    // nothing to do
  }
}
