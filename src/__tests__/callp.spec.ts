import { callp } from '../callp';
import { timer } from 'rxjs';
import { map, tap, toArray } from 'rxjs/operators';

describe('callp', () => {
  const TEST_CALL_TIMEOUT = 50;

  function createTestSequence(n: number) {
    const result: any[] = [];
    const tasks: Function[] = [];
    function createTask(i: number) {
      return () => {
        const observable = timer(TEST_CALL_TIMEOUT).pipe(map(() => `res-${i}`));
        return observable.pipe(tap(() => (result[i] = { time: Date.now() })));
      };
    }
    for (let i = 0; i < n; i++) {
      tasks[i] = createTask(i);
    }
    return [tasks, result];
  }

  it('should call all tasks', async () => {
    const [tasks, result] = createTestSequence(3);
    await callp(tasks)
      .pipe(toArray())
      .toPromise();
    for (let i = 0; i < 3; i++) {
      expect(result[i]).toBeDefined();
    }
  });

  it('should call tasks one after another', async () => {
    const [tasks, result] = createTestSequence(5);
    await callp(tasks)
      .pipe(toArray())
      .toPromise();
    for (let i = 1; i < 3; i++) {
      expect(result[i].time).toBeLessThanOrEqual(result[0].time + TEST_CALL_TIMEOUT);
    }
  });
});
