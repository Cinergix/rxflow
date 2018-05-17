import { Observable } from 'rxjs';

/**
 * A function which takes no arguments and returns an observable.
 */
export type ObservableFactory = () => Observable<any>;
