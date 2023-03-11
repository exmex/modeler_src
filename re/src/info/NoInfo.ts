/* eslint-disable @typescript-eslint/no-unused-vars */
import { Info } from "./Info";

export class NoInfo implements Info {
    public reportSuccessConnect(version: string, databases: string[]): void {
        // no code needed
    }

    public reportSuccess(): void {
        // no code needed
    }

    public reportError(error: Error, category: string): void {
        // no code needed
    }
}
