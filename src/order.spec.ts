import { order, OrderTest } from './order';

describe('order', () => {
  function createTestSubject<T>(test: OrderTest<T>) {
    const sub = order(test);
    const res: T[] = [];
    sub.subscribe(v => res.push(v));
    return { sub, res };
  }

  it('should emit first value immediately', () => {
    const { sub, res } = createTestSubject(() => false);
    sub.next(100);
    expect(res).toEqual([100]);
  });

  it('should emit first value without running order function', () => {
    let ranOrderFn = false;
    const { sub } = createTestSubject(() => (ranOrderFn = true));
    sub.next(100);
    expect(ranOrderFn).toEqual(false);
  });

  it('should emit second value if order function returns true', () => {
    const { sub, res } = createTestSubject(() => true);
    sub.next(100);
    expect(res).toEqual([100]);
    sub.next(200);
    expect(res).toEqual([100, 200]);
  });

  it('should emit pending values when order function returns true', () => {
    const { sub, res } = createTestSubject<number>((a, b) => a + 1 === b);
    sub.next(1);
    sub.next(4);
    sub.next(3);
    sub.next(5);
    expect(res).toEqual([1]);
    sub.next(2);
    expect(res).toEqual([1, 2, 3, 4, 5]);
  });
});
