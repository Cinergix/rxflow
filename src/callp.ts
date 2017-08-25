import { Observable } from 'rxjs';

export type CallPStep = () => Observable<any>;

export function callp(tasks: CallPStep[]): Observable<any[]> {
  const observables = tasks.map(t => Observable.defer(t));
  return Observable.combineLatest(observables);
}
