import { MoonModelerModel } from "common";
import { Source } from "./Source";
import fs from "fs";
import path from "path";

export class FileSource<T extends MoonModelerModel> extends Source<T> {
    private filename: string;

    public constructor(filename: string) {
        super();
        this.filename = filename;
    }

    public loadModel(): T {
        return JSON.parse(fs.readFileSync(this.filename).toString());
    }

    public storeModel(model: T): void {
        this.checkDirectorySync(path.dirname(this.filename));
        fs.writeFileSync(this.filename, JSON.stringify(model, null, "\t"));
    }

    private checkDirectorySync(directory: string): void {
        try {
            fs.statSync(directory);
        } catch (e) {
            fs.mkdirSync(directory, { recursive: true });
        }
    }
}