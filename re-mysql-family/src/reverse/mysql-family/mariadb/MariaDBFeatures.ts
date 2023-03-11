import * as compareVersions from "compare-versions";

import { MySQLFamilyFeatures } from "../common/MySQLFamilyFeatures";
import { Platform } from "re";

export class MariaDBFeatures implements MySQLFamilyFeatures {
  public constructor(
    private version: string,
    private isSchemaMySQLAvailable: boolean
  ) { }

  public schemaMySQLAvailable(): boolean {
    return this.isSchemaMySQLAvailable;
  }

  public getMinimalSupportedVersion(): string {
    return "5.5.23";
  }

  public isSupported(): boolean {
    return compareVersions.compare(
      this.version,
      this.getMinimalSupportedVersion(),
      ">="
    );
  }

  public viewAlgorithm(): boolean {
    return compareVersions.compare(this.version, "10.1.3", ">=");
  }

  public fulltextIndexColumn(): boolean {
    return compareVersions.compare(this.version, "10.0.5", ">=");
  }

  public JSON(): boolean {
    return compareVersions.compare(this.version, "10.4.3", ">=");
  }

  public expressionBrackets(): boolean {
    return compareVersions.compare(this.version, "10.2.0", ">=");
  }

  public virtualColumns(): boolean {
    return compareVersions.compare(this.version, "10.2.3", ">=");
  }

  public aggregateFunction(): boolean {
    return compareVersions.compare(this.version, "10.3.3", ">=");
  }

  public checkConstraint(): boolean {
    return (
      (compareVersions.compare(this.version, "10.2.22", ">=") &&
        compareVersions.compare(this.version, "10.3.0", "<")) ||
      compareVersions.compare(this.version, "10.3.10", ">=")
    );
  }

  public generationExpression(): boolean {
    return compareVersions.compare(this.version, "10.2.5", ">=");
  }

  public compressedColumn(): boolean {
    return (
      compareVersions.compare(this.version, "10.2.0", ">=") &&
      compareVersions.compare(this.version, "10.6.0", "<")
    );
  }

  public expressionGeneratedExtraDefault(): boolean {
    return false;
  }

  public expressionQuotedDefault(): boolean {
    return compareVersions.compare(this.version, "10.2.0", ">=");
  }

  public expressionDefault(): boolean {
    return compareVersions.compare(this.version, "10.2.0", ">=");
  }

  public expressionBracketsDefault(): boolean {
    return false;
  }

  public escapedDefault(): boolean {
    return false;
  }

  public generatedColumnExtraBrackets(): boolean {
    return false;
  }

  public virtualColumnPersistant(): boolean {
    return true;
  }

  public implicitFunctionContainsSQL(): boolean {
    return true;
  }

  public modelType(): string {
    return Platform.MARIADB;
  }

  public schemaComments(): boolean {
    return compareVersions.compare(this.version, "10.5.0", ">=");
  }
}
