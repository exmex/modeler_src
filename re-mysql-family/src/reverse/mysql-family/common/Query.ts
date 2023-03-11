export interface Query<T> {
    execute(): Promise<T>;
}
