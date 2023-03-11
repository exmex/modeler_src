import { DocumentNode } from "graphql/language/ast";
import { parse } from "graphql/language/parser";

export interface DocumentScript {
  document: DocumentNode;
  script: string;
}

export class GraphQLSchemaPreprocessor {
  constructor(private originalScript: string) {}

  private removeQueryDescription(script: string) {
    return script.replace(/"""([^"]*)"""[\W]*query/gm, "query");
  }

  private removeMutationDescription(script: string) {
    return script.replace(/"""([^"]*)"""[\W]*mutation/gm, "mutation");
  }

  public parseDocument(): DocumentScript {
    try {
      return {
        script: this.originalScript,
        document: parse(this.originalScript)
      };
    } catch (e) {
      let modifiedScript = this.removeQueryDescription(this.originalScript);
      modifiedScript = this.removeMutationDescription(modifiedScript);
      return { script: modifiedScript, document: parse(modifiedScript) };
    }
  }
}
