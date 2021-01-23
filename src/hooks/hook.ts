export interface JestFunctionHook<T> {
    match: (arg: unknown) => arg is T;
    map: (arg: T, timeout: number) => Promise<void> | undefined;
}
