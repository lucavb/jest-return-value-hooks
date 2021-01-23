import { JestFunctionHook } from './hook';
import { isObservable, Observable } from 'rxjs';
import { take, timeout } from 'rxjs/operators';

export const rxjsHook: JestFunctionHook<Observable<unknown>> = {
    match: isObservable,
    map: (ob$, timeoutAfter) => {
        return new Promise<void>((resolve, reject) => {
            ob$.pipe(take(1), timeout(timeoutAfter)).subscribe({
                complete: () => resolve(),
                error: (err) => reject(err),
            });
        });
    },
};
