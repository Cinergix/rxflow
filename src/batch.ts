import { Observable } from 'rxjs';

export function batch<T>(time: number, input: Observable<T>): Observable<{ type: string; event: T }> {
  let done: boolean = true;
  return input.switchMap(event => {
    let obs: Observable<{ type: string; event: T }> = Observable.of();
    if (done) {
      done = false;
      obs = Observable.concat(obs, Observable.of({ type: 'start', event }));
    }
    const next = Observable.create((observer: any) => {
      observer.next({ type: 'event', event });
      const timeout = setTimeout(() => {
        done = true;
        observer.next({ type: 'end', event });
        observer.complete();
      }, time);
      return () => clearTimeout(timeout);
    });
    obs = Observable.concat(obs, next);
    return obs;
  });
}
