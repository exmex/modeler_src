import { MySQLFamilyFeatures } from "../common/MySQLFamilyFeatures";
import { Platform } from "re";
import compareVersions from "compare-versions";

export class MySQLFeatures implements MySQLFamilyFeatures {
  public constructor(
    private version: string,
    private isMySQLSchemaAvailable: boolean
  ) {}

  public schemaMySQLAvailable(): boolean {
    return this.isMySQLSchemaAvailable;
  }

  public getMinimalSupportedVersion(): string {
    return "5.7.0";
  }

  public isSupported(): boolean {
    return compareVersions.compare(
      this.version,
      this.getMinimalSupportedVersion(),
      ">="
    );
  }

  public fulltextIndexColumn(): boolean {
    return true;
  }

  public schemaComments(): boolean {
    return false;
  }

  public viewAlgorithm(): boolean {
    return false;
  }

  public JSON(): boolean {
    return true;
  }

  public expressionBrackets(): boolean {
    return false;
  }

  public virtualColumns(): boolean {
    return true;
  }

  public aggregateFunction(): boolean {
    return false;
  }

  public checkConstraint(): boolean {
    return false;
  }

  public generationExpression(): boolean {
    return true;
  }

  public expressionGeneratedExtraDefault(): boolean {
    return compareVersions.compare(this.version, "5.8.0", ">=");
  }

  public expressionQuotedDefault(): boolean {
    return false;
  }

  public expressionDefault(): boolean {
    return compareVersions.compare(this.version, "5.8.0", ">=");
  }

  public escapedDefault(): boolean {
    return compareVersions.compare(this.version, "5.8.0", ">=");
  }

  public expressionBracketsDefault(): boolean {
    return compareVersions.compare(this.version, "5.8.0", ">=");
  }

  public compressedColumn(): boolean {
    return true;
  }

  public generatedColumnExtraBrackets(): boolean {
    return true;
  }

  public virtualColumnPersistant(): boolean {
    return false;
  }

  public implicitFunctionContainsSQL(): boolean {
    return false;
  }

  public modelType(): string {
    return Platform.MYSQL;
  }
}
