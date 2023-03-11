export class TriggerMetadata {
    public triggerName: string;
    public triggerTime: string;
    public triggerEvent: string;
    public tableName: string;
    public triggerStmt: string;
    public definer: string;

    public constructor(
        triggerName: string,
        triggerTime: string,
        triggerEvent: string,
        tableName: string,
        triggerStmt: string,
        definer: string,
    ) {
        this.triggerName = triggerName;
        this.triggerTime = triggerTime;
        this.triggerEvent = triggerEvent;
        this.tableName = tableName;
        this.triggerStmt = triggerStmt;
        this.definer = definer;
    }
}
