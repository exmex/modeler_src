export interface Info {
    reportSuccessConnect(version: string, databases: string[]): void;
    reportSuccess(): void;

    reportError(error: unknown, category: string): void;
}
