import { Features } from "re";
import compareVersions from "compare-versions";

export class SQLiteFeatures implements Features {
    public constructor(private _version: string) { }

    public getMinimalSupportedVersion(): string {
        return "0.0.0";
    }

    public isSupported(): boolean {
        return compareVersions.compare(this._version, this.getMinimalSupportedVersion(), ">=");
    }
}
