import { Observable, empty, concat, defer } from 'rxjs';
import { ObservableFactory } from './types';

/**
 * Executes an array of observable returning functions sequentially.
 * @param tasks An array of functions to execute sequentially
 */
export function calls(tasks: ObservableFactory[]): Observable<any> {
  let combined: Observable<any> = empty();
  for (const task of tasks) {
    combined = concat(combined, defer(task));
  }
  return combined;
}
