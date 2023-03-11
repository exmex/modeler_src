export class ParentProcesNotification {
    private _lastSend: number = 0;
    private _progress: {
        parts: {
            [key: string]: { total: number, current: number }
        },
        missingReferences: number,
        modelType: string
    } = { parts: {}, missingReferences: 0, modelType: this._modelType };

    constructor(private _modelType: string) { }

    public send() {
        if (process.send) {
            process.send(this._progress);
        }
    }

    public sendMissingReference() {
        this._progress.missingReferences += 1;
    }

    public sendPartProgressChange(name: string, current: number) {
        this._progress.parts[name] = { total: this._progress.parts[name] ? this._progress.parts[name].total : 0, current };
        if (process.send) {
            const now = Date.now();
            if (this._lastSend + 1000 < now) {
                process.send(this._progress);
                this._lastSend = now;
            }
        }
    }

    public registerPart(name: string, total: number) {
        this._progress.parts[name] = { total, current: 0 };
    }
}