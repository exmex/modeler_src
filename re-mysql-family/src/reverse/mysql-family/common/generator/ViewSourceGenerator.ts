import { DefinerQuotation } from "./DefinerQuotation";
import { ViewMetadata } from "../metadata/ViewMetadata";
import { MySQLFamilyFeatures } from "../MySQLFamilyFeatures";

export class ViewSourceGenerator {
    public constructor(private viewMetadata: ViewMetadata, private features: MySQLFamilyFeatures) {
    }

    public generate(): string {
        return (
            "CREATE\n" +
            this.evalAlgorithm() +
            this.evalDefiner() +
            `VIEW \`${this.viewMetadata.name}\`\n` +
            "AS\n" +
            this.viewMetadata.viewDefinition +
            `\n` +
            this.evalWithCheckOption() +
            `;`
        );
    }

    private evalWithCheckOption(): string {
        switch (this.viewMetadata.checkOption) {
            case "LOCAL":
                return "WITH LOCAL CHECK OPTION";
            case "CASCADED":
                return "WITH CASCADED CHECK OPTION";
            default:
                return "";
        }
    }

    private evalDefiner(): string {
        if ("DEFINER" === this.viewMetadata.securityType) {
            return `\tDEFINER = ${DefinerQuotation.quoteDefiner(this.viewMetadata.definer)}\n`;
        }
        return this.viewMetadata.securityType ? `SQL SECURITY ${this.viewMetadata.securityType}\n` : "";
    }

    private evalAlgorithm(): string {
        if (this.viewMetadata.algorithm === "UNDEFINED" || !this.features.viewAlgorithm()) {
            return "";
        }
        return this.viewMetadata.algorithm ? `\tALGORITHM = ${this.viewMetadata.algorithm}\n` : "";
    }
}
