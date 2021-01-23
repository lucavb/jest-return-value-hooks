import { of } from 'rxjs';

describe('patching jest', () => {
    describe('it/test functions', () => {
        [test, it].forEach((testFunction) => {
            testFunction(`accepts observables - ${testFunction.name}`, () => {
                return of(5);
            });

            testFunction(`still accepts promises - ${testFunction.name}`, () => {
                return Promise.resolve();
            });

            testFunction(`still provides the done parameter if desired - ${testFunction.name}`, (done) => {
                done();
            });
        });
    });

    describe('life cycle', () => {
        [beforeAll, beforeEach, afterAll, afterEach].forEach((lifeCycleFunction) => {
            lifeCycleFunction(() => {
                return of(3);
            });

            lifeCycleFunction(() => {
                return Promise.resolve();
            });

            lifeCycleFunction((done) => {
                done();
            });

            it(`can run this test - ${lifeCycleFunction.name}`, () => {
                expect(true).toBe(true);
            });
        });
    });
});
