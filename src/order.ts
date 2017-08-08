import { Subject } from 'rxjs';

export type OrderTest<T> = (a: T, b: T) => boolean;

export class OrderedSubject<T> extends Subject<T> {
  private queue: T[] = [];
  private prevs: T;

  constructor(private test: OrderTest<T>) {
    super();
  }

  next(value: T) {
    if (this.prevs === undefined) {
      this.emit(value);
    } else if (this.test(this.prevs, value)) {
      this.emit(value);
      this.process();
    } else {
      this.enqueue(value);
    }
  }

  emit(value: T) {
    this.prevs = value;
    super.next(value);
  }

  process() {
    while (this.queue.length) {
      let emitted = false;
      this.queue.forEach(v => {
        if (this.test(this.prevs, v)) {
          emitted = true;
          this.emit(v);
        }
      });
      if (!emitted) {
        break;
      }
    }
  }

  enqueue(value: T) {
    let pos = this.queue.findIndex(v => this.test(value, v));
    if (pos === -1) {
      pos = this.queue.findIndex(v => this.test(v, value));
      pos = pos === -1 ? this.queue.length : pos + 1;
    }
    this.queue.splice(pos, 0, value);
  }
}

export function order<T>(test: OrderTest<T>): OrderedSubject<T> {
  return new OrderedSubject<T>(test);
}
