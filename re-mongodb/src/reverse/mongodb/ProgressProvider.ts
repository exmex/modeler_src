export interface ProgressProvider {
    register(): Promise<void>;
}