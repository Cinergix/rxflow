import { Observable, Observer } from 'rxjs';

/**
 * A function which checks if 2 items are in correct order
 */
export type OrderTest<T> = (a: T, b: T) => boolean;

/**
 * Takes an observable and re-orders emitted data using a order test function.
 * @param source  The source observable
 * @param testFn  The function to check if order is correct
 * @param initial The initial value to test data ordering
 */
export function order<T>(source: Observable<T>, testFn: OrderTest<T>, initial?: T): Observable<T> {
  return Observable.create((observer: Observer<T>) => {
    let queue: T[] = [];
    let prevs: T;

    if (initial) {
      prevs = initial;
    }

    function next(value: T) {
      if (prevs === undefined) {
        emit(value);
      } else if (testFn(prevs, value)) {
        emit(value);
        process();
      } else {
        enqueue(value);
      }
    }

    function emit(value: T) {
      prevs = value;
      observer.next(value);
    }

    function process() {
      while (queue.length) {
        let emitted = false;
        queue.forEach(v => {
          if (testFn(prevs, v)) {
            emitted = true;
            emit(v);
          }
        });
        if (!emitted) {
          break;
        }
      }
    }

    function enqueue(value: T) {
      let pos = queue.findIndex(v => testFn(value, v));
      if (pos === -1) {
        pos = queue.findIndex(v => testFn(v, value));
        pos = pos === -1 ? queue.length : pos + 1;
      }
      queue.splice(pos, 0, value);
    }

    const sub = source.subscribe({
      next: val => next(val),
      error: err => observer.error(err),
      complete: () => observer.complete(),
    });

    return () => sub.unsubscribe();
  });
}
