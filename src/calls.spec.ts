import { calls } from './calls';
import { Observable } from 'rxjs';

describe('calls', () => {
  const TEST_CALL_TIMEOUT = 50;

  function createTestSequence(n: number) {
    const result: any[] = [];
    const tasks: Function[] = [];
    function createTask(i: number) {
      return (res: any) => {
        const observable = Observable.timer(TEST_CALL_TIMEOUT).map(() => `res-${i}`);
        return observable.do(() => (result[i] = { res, time: Date.now() }));
      };
    }
    for (let i = 0; i < n; i++) {
      tasks[i] = createTask(i);
    }
    return [tasks, result];
  }

  it('should call all tasks', async () => {
    const [tasks, result] = createTestSequence(3);
    await calls(tasks).toArray().toPromise();
    for (let i = 0; i < 3; i++) {
      expect(result[i]).toBeDefined();
    }
  });

  it('should call tasks with prev task result', async () => {
    const [tasks, result] = createTestSequence(3);
    await calls(tasks).toArray().toPromise();
    for (let i = 0; i < 3; i++) {
      const expected = i === 0 ? null : `res-${i - 1}`;
      expect(result[i].res).toEqual(expected);
    }
  });

  it('should call tasks one after another', async () => {
    const [tasks, result] = createTestSequence(5);
    await calls(tasks).toArray().toPromise();
    for (let i = 1; i < 3; i++) {
      expect(result[i].time).toBeGreaterThanOrEqual(result[i - 1].time + TEST_CALL_TIMEOUT);
    }
  });
});
