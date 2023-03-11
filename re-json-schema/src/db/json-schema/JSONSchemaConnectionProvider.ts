import { ConnectionProvider } from "re";
import { JSONSchemaFeatures } from "./JSONSchemaFeatures";
import { JSONSchemaHandledConnection } from "./JSONSchemaHandledConnection";
import fs from "fs";
import json5 from "json5";
import yaml from "yaml";

export class JSONSchemaConnectionProvider
  implements
    ConnectionProvider<JSONSchemaFeatures, JSONSchemaHandledConnection>
{
  private schemaFilename: string;

  public constructor(schemaFilename: string) {
    this.schemaFilename = schemaFilename;
  }

  private getExtension() {
    return this.schemaFilename.split(".").pop();
  }

  public async createConnection(): Promise<JSONSchemaHandledConnection> {
    const schemaFileBuffer = await fs.promises.readFile(this.schemaFilename);
    const schemaText = schemaFileBuffer.toString();

    switch (this.getExtension()) {
      case "yaml":
        return this.parseYAML(schemaText);
      default:
        return this.parseJSON(schemaText);
    }
  }

  private parseJSON(
    schemaText: string
  ): JSONSchemaHandledConnection | PromiseLike<JSONSchemaHandledConnection> {
    try {
      return new JSONSchemaHandledConnection(
        JSON.parse(schemaText),
        true,
        "json"
      );
    } catch {
      return new JSONSchemaHandledConnection(
        json5.parse(schemaText),
        false,
        "json"
      );
    }
  }

  private parseYAML(
    schemaText: string
  ): JSONSchemaHandledConnection | PromiseLike<JSONSchemaHandledConnection> {
    return new JSONSchemaHandledConnection(
      yaml.parse(schemaText),
      false,
      "yaml"
    );
  }
}
