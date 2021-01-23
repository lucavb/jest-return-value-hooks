# jest-return-value-hooks

This project allows you to hook into the handling of the
return values of your tests, and the lifecycle functions.

Why would you want this? Currently, [Jest](https://jestjs.io/)
only supports `Promise<void>` or `undefined` as return values.
However, you might want to pass different values back such
as Observables from [RxJS](https://github.com/ReactiveX/rxjs).
You can implement the `JestFunctionHook` interface and then pass
it along to the two functions `patchLifeCycleFunctions` and
`patchTestFunctions`. They accept multiple hooks at once to avoid
overhead.

## How to use

Add this to your Jest configuration

```json
{
    "setupFilesAfterEnv": ["jest-return-value-hooks"]
}
```

and your Jest tests will accept Observables as an additional
return value. As an alternative you can also implement the
aforementioned `JestFunctionHook` and call the mentioned methods
like so

```typescript
import { patchTestFunctions, patchLifeCycleFunctions, JestFunctionHook } from 'jest-return-value-hooks';
import { Observable, isObservable } from 'rxjs';

const hook: JestFunctionHook = {
    match: isObservable,
    map: (ob: Observable<unknown>, timeoutAfter: number) => new Promise.resolve(),
};

patchLifeCycleFunctions(hook);
patchTestFunctions(hook);
```

and then point Jest the same way as mentioned above to your file.

## Credit

Parts of this code stem originally from the
[jest-jasmine2](https://github.com/facebook/jest)
project, which is released under the MIT License, however adaptions
have been made to provide hooks to users.
