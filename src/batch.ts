import { Observable, Observer, empty, concat, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

/**
 * Batch event types.
 */
export type BatchEventType = 'start' | 'data' | 'end';

/**
 * Observable returned from batch function will emit this type.
 */
export type BatchEventData<T> = { type: BatchEventType; data: T };

/**
 * Groups data emitted from given observable into batches by time.
 * @param source   The source observable
 * @param duration Time in milliseconds to wait before ending current batch
 */
export function batch<T>(source: Observable<T>, duration: number): Observable<BatchEventData<T>> {
  let batchStarted = false;
  return source.pipe(
    switchMap(data => {
      let observable: Observable<BatchEventData<T>> = empty();
      if (!batchStarted) {
        batchStarted = true;
        observable = concat(observable, of<BatchEventData<T>>({ type: 'start', data }));
      }
      const dataAndEnd = Observable.create((observer: Observer<BatchEventData<T>>) => {
        observer.next({ type: 'data', data });
        const timeout = setTimeout(() => {
          batchStarted = false;
          observer.next({ type: 'end', data });
          observer.complete();
        }, duration);
        return () => clearTimeout(timeout);
      });
      return concat(observable, dataAndEnd);
    })
  );
}
