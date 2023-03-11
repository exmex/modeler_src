import { KnownIdRegistry, ReverseEngineer } from "re";

import { GraphQLFeatures } from "../../db/graphql/GraphQLFeatures";
import { GraphQLHandledConnection } from "../../db/graphql/GraphQLHandledConnection";
import { GraphQLModelBuilderFactory } from "./GraphQLModelBuilderFactory";
import { MoonModelerModel } from "common";

export class GraphQLReverseEngineer extends ReverseEngineer<
  GraphQLFeatures,
  GraphQLHandledConnection
> {
  protected async prepareModel(
    connection: GraphQLHandledConnection
  ): Promise<MoonModelerModel> {
    const modelBuilderFactory = new GraphQLModelBuilderFactory(
      connection.parser,
      new KnownIdRegistry(false, false, undefined),
      this.reverseOptions
    );
    const modelBuilder = modelBuilderFactory.createBuilder();
    return modelBuilder.build();
  }
}
