import { Features } from "re";
import compareVersions from "compare-versions";

export class MSSQLFeatures implements Features {
  private version: string;

  public constructor(version: string) {
    this.version = version;
  }

  private isVersionOrBetter(version: string): boolean {
    try {
      return compareVersions.compare(this.version, version, ">=");
    } catch {
      return true;
    }
  }

  public getMinimalSupportedVersion(): string {
    return "12.0.0";
  }

  public isSupported(): boolean {
    return this.isVersionOrBetter(this.getMinimalSupportedVersion());
  }
}
