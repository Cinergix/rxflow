import { Observable, Subscriber } from 'rxjs';

export type OrderTest<T> = (a: T, b: T) => boolean;

export function order<T>(test: OrderTest<T>, input: Observable<T>): Observable<T> {
  return Observable.create((subscriber: Subscriber<T>) => {
    let queue: T[] = [];
    let prevs: T;

    function next(value: T) {
      if (prevs === undefined) {
        emit(value);
      } else if (test(prevs, value)) {
        emit(value);
        process();
      } else {
        enqueue(value);
      }
    }

    function emit(value: T) {
      prevs = value;
      subscriber.next(value);
    }

    function process() {
      while (queue.length) {
        let emitted = false;
        queue.forEach(v => {
          if (test(prevs, v)) {
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
      let pos = queue.findIndex(v => test(value, v));
      if (pos === -1) {
        pos = queue.findIndex(v => test(v, value));
        pos = pos === -1 ? queue.length : pos + 1;
      }
      queue.splice(pos, 0, value);
    }

    const sub = input.subscribe({
      next: val => next(val),
      error: err => subscriber.error(err),
      complete: () => subscriber.complete(),
    });

    return () => sub.unsubscribe();
  });
}
