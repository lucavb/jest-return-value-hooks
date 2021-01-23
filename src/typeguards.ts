import { Jasmine } from 'jest-jasmine2';

export const isRecord = (arg: unknown): arg is Record<string, unknown> =>
    typeof arg === 'object' && !!arg && !Array.isArray(arg);

export const isJasmine = (arg: unknown): arg is Jasmine =>
    isRecord(arg) &&
    typeof arg.getEnv === 'function' &&
    typeof arg.DEFAULT_TIMEOUT_INTERVAL === 'number' &&
    typeof arg.createSpy === 'function';
