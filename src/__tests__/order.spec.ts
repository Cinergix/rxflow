import { Subject } from 'rxjs';
import { order, OrderTest } from '../order';

describe('order', () => {
  function createTestSubject<T>(test: OrderTest<T>, complete: Function = () => null, initial?: T) {
    const input = new Subject<T>();
    const res: T[] = [];
    const err: Error[] = [];
    const sub = order(input, test, initial).subscribe(v => res.push(v), e => err.push(e), () => complete());
    return { input, res, err, sub };
  }

  it('should emit first value immediately', () => {
    const { input, res } = createTestSubject(() => false);
    input.next(100);
    expect(res).toEqual([100]);
  });

  it('should emit first value with initial value if test returns true', () => {
    const { input, res } = createTestSubject(() => true, () => {}, 100);
    input.next(200);
    expect(res).toEqual([200]);
  });

  it('should not emit first value with initial value if test returns false', () => {
    const { input, res } = createTestSubject(() => false, () => {}, 100);
    input.next(200);
    expect(res).toEqual([]);
  });

  it('should emit first value without running order function', () => {
    let ranOrderFn = false;
    const { input } = createTestSubject(() => (ranOrderFn = true));
    input.next(100);
    expect(ranOrderFn).toEqual(false);
  });

  it('should emit second value if order function returns true', () => {
    const { input, res } = createTestSubject(() => true);
    input.next(100);
    expect(res).toEqual([100]);
    input.next(200);
    expect(res).toEqual([100, 200]);
  });

  it('should emit pending values when order function returns true', () => {
    const { input, res } = createTestSubject<number>((a, b) => a + 1 === b);
    input.next(1);
    input.next(4);
    input.next(3);
    input.next(5);
    expect(res).toEqual([1]);
    input.next(2);
    expect(res).toEqual([1, 2, 3, 4, 5]);
  });

  it('should unsubscribe input subscription', () => {
    const { input, sub, res } = createTestSubject(() => false);
    sub.unsubscribe();
    input.next(100);
    expect(res).toEqual([]);
  });

  it('should throw if input subscription throws', () => {
    const { input, err } = createTestSubject(() => false);
    const testError = new Error('test');
    input.error(testError);
    expect(err).toEqual([testError]);
  });

  it('should complete if input subscription completes', () => {
    let completed = false;
    const complete = () => (completed = true);
    const { input } = createTestSubject(() => false, complete);
    input.complete();
    expect(completed).toEqual(completed);
  });
});
