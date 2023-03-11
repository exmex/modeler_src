import { ModelPartProvider } from "../../model/provider/ModelPartProvider";
import { Warning } from "common";

export class WarningsProvider implements ModelPartProvider<Warning[]> {
  private warnings: Warning[];

  public constructor() {
    this.warnings = [];
  }

  public provide(): Promise<Warning[]> {
    return Promise.resolve(this.warnings);
  }

  public addWarning(message: string) {
    this.warnings.push({ message } as Warning);
  }
}
