import { ReferenceSearch } from "./ReferenceSearch";

export class ReverseOptions {
  public constructor(
    public outputFilename: string,
    public sampleLimit: number,
    public autolayout: boolean,
    public includeSchema: boolean,
    public source: string,
    public referenceSearch: ReferenceSearch,
    public connectionId: string,
    public connectionName: string,
    public modelToUpdateFilename?: string
  ) {}
}
