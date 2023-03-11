export interface ModelPartProvider<T> {
    provide(): Promise<T>;
}
