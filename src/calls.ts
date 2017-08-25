import { Observable } from 'rxjs';

export type CallSStep = (result: any) => Observable<any>;

export function calls(tasks: CallSStep[]): Observable<any> {
  let promise: Promise<any> = Promise.resolve(null);
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    promise = promise.then(result => task(result).toPromise());
  }
  return Observable.fromPromise(promise);
}
