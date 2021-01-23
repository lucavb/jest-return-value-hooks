import { Jasmine } from 'jest-jasmine2';
import { DoneFn, QueueableFn } from 'jest-jasmine2/build/queueRunner';
import Spec from 'jest-jasmine2/build/jasmine/Spec';
import { Observable } from 'rxjs';
import isGeneratorFn from 'is-generator-fn';
import co from 'co';
import { isJasmine } from './typeguards';
import { doneFnNoop } from './jest-helpers';
import { JestFunctionHook } from './hooks';

export const patchTestFunctions = (...hooks: JestFunctionHook<any>[]) => {
    const jasmine = global.jasmine;
    if (isJasmine(jasmine)) {
        const env = jasmine.getEnv();

        const observeIt = (
            jasmineTestFunction: (description: string, fn: QueueableFn['fn'], timeout?: number) => Spec,
            env: Jasmine['currentEnv_'],
        ) => {
            return (
                specName: string,
                specFunction?: (done: DoneFn) => void | PromiseLike<void> | Observable<unknown>,
                timeoutAfter?: number,
            ): Spec => {
                if (!specFunction) {
                    // @ts-expect-error: missing fn arg is handled by originalFn
                    return jasmineTestFunction.call(env);
                }

                const hasDoneCallback = typeof specFunction === 'function' && specFunction.length > 0;

                if (hasDoneCallback) {
                    return jasmineTestFunction.call(env, specName, specFunction, timeoutAfter);
                }

                const passedAlongTestFunction = (): unknown => {
                    const wrappedActualTestFunction = isGeneratorFn(specFunction)
                        ? co.wrap(specFunction)
                        : specFunction;
                    const returnValue: unknown = wrappedActualTestFunction.call({}, doneFnNoop);

                    for (const hook of hooks) {
                        if (hook.match(returnValue)) {
                            return hook.map(returnValue, timeoutAfter ?? jasmine.DEFAULT_TIMEOUT_INTERVAL);
                        }
                    }
                    return returnValue;
                };
                return jasmineTestFunction.call(env, specName, passedAlongTestFunction, timeoutAfter);
            };
        };

        env.it = observeIt(env.it, env);
        env.test = observeIt(env.test, env);
    }
};
