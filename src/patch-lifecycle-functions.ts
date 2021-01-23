import { Jasmine } from 'jest-jasmine2';
import { DoneFn, QueueableFn } from 'jest-jasmine2/build/queueRunner';
import isGeneratorFn from 'is-generator-fn';
import co from 'co';
import { doneFnNoop } from './jest-helpers';
import { isJasmine } from './typeguards';
import { JestFunctionHook } from './hooks';

export const patchLifeCycleFunctions = (...hooks: JestFunctionHook<any>[]) => {
    const jasmine = global.jasmine;
    if (isJasmine(jasmine)) {
        const env = jasmine.getEnv();

        const observeIt = (
            originalFn: (beforeAllFunction: QueueableFn['fn'], timeout?: number) => void,
            env: Jasmine['currentEnv_'],
        ) => {
            return <T>(
                fn: ((done: DoneFn) => void | PromiseLike<T>) | (() => Promise<T>) | GeneratorFunction | undefined,
                timeoutAfter?: number,
            ): void => {
                if (!fn) {
                    // @ts-expect-error: missing fn arg is handled by originalFn
                    return originalFn.call(env);
                }

                const hasDoneCallback = typeof fn === 'function' && fn.length > 0;

                if (hasDoneCallback) {
                    // Jasmine will handle it
                    return originalFn.call(env, fn, timeoutAfter);
                }

                const newJestLifeCycleFunction = () => {
                    const wrappedFn = isGeneratorFn(fn) ? co.wrap(fn) : fn;
                    const returnValue: unknown = wrappedFn.call({}, doneFnNoop);

                    for (const hook of hooks) {
                        if (hook.match(returnValue)) {
                            return hook.map(returnValue, timeoutAfter ?? jasmine.DEFAULT_TIMEOUT_INTERVAL);
                        }
                    }
                    return returnValue;
                };

                return originalFn.call(env, newJestLifeCycleFunction, timeoutAfter);
            };
        };

        env.afterAll = observeIt(env.afterAll, env);
        env.afterEach = observeIt(env.afterEach, env);
        env.beforeAll = observeIt(env.beforeAll, env);
        env.beforeEach = observeIt(env.beforeEach, env);
    }
};
