import { HandledConnection, Platform } from "re";

import { JSONSchemaFeatures } from "./JSONSchemaFeatures";
import { JSONSchemaProvider } from "./JSONSchemaProvider";

export class JSONSchemaHandledConnection
  implements HandledConnection<JSONSchemaFeatures>, JSONSchemaProvider
{
  public constructor(
    public readonly schema: any,
    public readonly strict: boolean,
    public readonly format: string
  ) {}

  public async getServerPlarform(): Promise<Platform> {
    return Platform.JSONSCHEMA;
  }

  public getFeatures(): Promise<JSONSchemaFeatures> {
    return Promise.resolve(new JSONSchemaFeatures());
  }

  public async getServerVersion(): Promise<string> {
    return "";
  }

  public async getServerDescription(): Promise<string> {
    return "JSONSchema";
  }

  public async close(): Promise<void> {
    // nothing to do
  }
}
