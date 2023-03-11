import { Features } from "re";
import compareVersions from "compare-versions";

export class PgFeatures implements Features {
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
    return "9.5.0";
  }

  public isSupported(): boolean {
    return this.isVersionOrBetter(this.getMinimalSupportedVersion());
  }

  public snapshotType(): boolean {
    return this.isVersionOrBetter("13.0.0");
  }

  public macaddr8Type(): boolean {
    return this.isVersionOrBetter("10.0.0");
  }

  public generatedIdentity(): boolean {
    return this.isVersionOrBetter("10.0.0");
  }

  public generatedColumns(): boolean {
    return this.isVersionOrBetter("12.0.0");
  }

  public parallelWorkers(): boolean {
    return this.isVersionOrBetter("9.6.0");
  }

  public tablePartitions(): boolean {
    return this.isVersionOrBetter("10.0.0");
  }

  public defaultPartitions(): boolean {
    return this.isVersionOrBetter("11.0.0");
  }

  public hashPartitions(): boolean {
    return this.isVersionOrBetter("11.0.0");
  }

  public partitionConstraints(): boolean {
    return this.isVersionOrBetter("11.0.0");
  }

  public foreignKeyToPartitionTable(): boolean {
    return this.isVersionOrBetter("12.0.0");
  }

  public procedures(): boolean {
    return this.isVersionOrBetter("11.0.0");
  }

  public sequences(): boolean {
    return this.isVersionOrBetter("11.0.0");
  }

  public triggerFunctions(): boolean {
    return this.isVersionOrBetter("12.0.0");
  }

  public restrictivePolicies(): boolean {
    return this.isVersionOrBetter("10.0.0");
  }

  public enhancedProcedures(): boolean {
    return this.isVersionOrBetter("14.0.0");
  }
}
