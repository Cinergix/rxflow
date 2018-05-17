# rxflow

Includes some rxjs operators to control data flow.

### batch

Groups data emitted from source observable into batches by emitted time.

```ts
import { Observable } from 'rxjs';
import { batch } from '@creately/rxflow';

function sleep(t) {
    return new Promise(f => setTimeout(f, t));
}

const source = Observable.create(async function(observer) {
    observer.next(1);
    observer.next(2);
    await sleep(20);
    observer.next(3);
    await sleep(160);
    observer.next(4);
    await sleep(70);
    observer.next(5);
    await sleep(80);
    observer.next(6);
    await sleep(310);
    observer.complete();
});

batch(source, 100).subscribe();
// { type: 'start', data: 1 }
// { type: 'data', data: 1 }
// { type: 'data', data: 2 }
// --- wait 20ms
// { type: 'data', data: 3 }
// --- wait 100ms
// { type: 'end', data: 3 }
// --- wait 60ms
// { type: 'start', data: 4 }
// { type: 'data', data: 4 }
// --- wait 70ms
// { type: 'data', data: 5 }
// --- wait 80ms
// { type: 'data', data: 6 }
// --- wait 100ms
// { type: 'end', data: 6 }
// --- wait 210ms
// complete
```

### callp

Executes an array of functions which returns observables concurrently.
It will emit an array which will contain the last emitted values from
each observable.

```ts
import { of, concat } from 'rxjs';
import { delay } from 'rxjs/operators';
import { callp } from '@creately/rxflow';

const tasks = [
    () => of(1, 2),
    () => concat(of(3), of(4).pipe(delay(100))),
    () => concat(of(5), of(6).pipe(delay(200))),
];

callp(tasks).subscribe();
// [ 2, 3, 5 ]
// --- wait 100ms
// [ 2, 4, 5 ]
// --- wait 100ms
// [ 2, 4, 6 ]
// complete
```

### calls

Executes an array of functions which returns observables sequentially.
It will emit values from all observables in given order.

```ts
import { of, concat } from 'rxjs';
import { delay } from 'rxjs/operators';
import { calls } from '@creately/rxflow';

const tasks = [
    () => of(1, 2),
    () => concat(of(3), of(4).pipe(delay(100))),
    () => concat(of(5), of(6).pipe(delay(200))),
];

calls(tasks).subscribe();
// 1
// 2
// 3
// --- wait 100ms
// 4
// 5
// --- wait 200ms
// 6
// complete
```

### order

Re-orders data emitted from source observable using a test function.

```ts
import { of, concat } from 'rxjs';
import { delay } from 'rxjs/operators';
import { order } from '@creately/rxflow';

const source = concat(
    of(1, 2),
    of(3).delay(100),
    of(5),
    of(6, 7).delay(200),
    of(4, 9).delay(300),
);

order(source).subscribe();
// 1
// 2
// --- wait 100ms
// 3
// --- wait 500ms
// 4
// 5
// 6
// 7
// complete
```
