import { DefinerQuotation } from "./DefinerQuotation";
import { TriggerMetadata } from "../metadata/TriggerMetadata";

export class TriggerSourceGenerator {
    private triggerMetadata: TriggerMetadata;

    public constructor(triggerMetadata: TriggerMetadata) {
        this.triggerMetadata = triggerMetadata;
    }

    public generate(): string {
        // https://mariadb.com/kb/en/library/create-trigger/
        return (
            "CREATE\n" +
            this.evalDefiner() +
            `TRIGGER ${this.triggerMetadata.triggerName}\n` +
            `${this.triggerMetadata.triggerTime} ${this.triggerMetadata.triggerEvent} ON\n` +
            `\t${this.triggerMetadata.tableName}\n` +
            `FOR EACH ROW\n` +
            `${this.triggerMetadata.triggerStmt}` +
            `;`
        );
    }

    private evalDefiner(): string {
        return `\tDEFINER = ${DefinerQuotation.quoteDefiner(this.triggerMetadata.definer)}\n`;
    }
}
