import { Observable, defer, combineLatest } from 'rxjs';
import { ObservableFactory } from './types';

/**
 * Executes an array of observable returning functions parallely.
 * @param tasks An array of functions to execute parallely
 */
export function callp(tasks: ObservableFactory[]): Observable<any> {
  let deferred: Observable<any>[] = [];
  for (const task of tasks) {
    deferred.push(defer(task));
  }
  return combineLatest(deferred);
}
