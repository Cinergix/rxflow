import { Observable, from, concat, of } from 'rxjs';
import { delay, toArray } from 'rxjs/operators';
import { batch } from '../batch';

describe('batch', () => {
  const TEST_BATCH_TIMEOUT = 50;

  function createTestObservables(...sizes: number[]): [number[][], Observable<number>] {
    const values = sizes.map(size => {
      const group = [];
      for (let i = 0; i < size; i++) {
        group.push(Math.random());
      }
      return group;
    });
    const observable = values
      .map((group, idx) => from(group).pipe(delay(idx * TEST_BATCH_TIMEOUT + 10)))
      .reduce((merged, obs) => concat(merged, obs));
    return [values, observable];
  }

  function batchAndGetResult(input: Observable<any>) {
    return batch(input, TEST_BATCH_TIMEOUT)
      .pipe(toArray())
      .toPromise();
  }

  it('should return an observables', () => {
    const out = batch(of(null), TEST_BATCH_TIMEOUT);
    expect(out instanceof Observable).toBe(true);
  });

  describe('single event', () => {
    it('should emit events in S1,E1,N1 order', async () => {
      const [values, observable] = createTestObservables(1);
      const out = await batchAndGetResult(observable);
      expect(out).toEqual([
        { type: 'start', data: values[0][0] },
        { type: 'data', data: values[0][0] },
        { type: 'end', data: values[0][0] },
      ]);
    });
  });

  describe('single 2 event batch (sync)', () => {
    it('should emit events in S1,E1,E2,N2 order', async () => {
      const [values, observable] = createTestObservables(2);
      const out = await batchAndGetResult(observable);
      expect(out).toEqual([
        { type: 'start', data: values[0][0] },
        { type: 'data', data: values[0][0] },
        { type: 'data', data: values[0][1] },
        { type: 'end', data: values[0][1] },
      ]);
    });
  });

  describe('2 single event batches (sync)', () => {
    it('should emit events in S1,E1,N1,S2,E2,N2 order', async () => {
      const [values, observable] = createTestObservables(1, 1);
      const out = await batchAndGetResult(observable);
      expect(out).toEqual([
        { type: 'start', data: values[0][0] },
        { type: 'data', data: values[0][0] },
        { type: 'end', data: values[0][0] },
        { type: 'start', data: values[1][0] },
        { type: 'data', data: values[1][0] },
        { type: 'end', data: values[1][0] },
      ]);
    });
  });

  describe('multiple 2 event batches (sync)', () => {
    it('should emit events in S1,E1,E2,N2,S3,E3,E4,N4 order', async () => {
      const [values, observable] = createTestObservables(2, 2);
      const out = await batchAndGetResult(observable);
      expect(out).toEqual([
        { type: 'start', data: values[0][0] },
        { type: 'data', data: values[0][0] },
        { type: 'data', data: values[0][1] },
        { type: 'end', data: values[0][1] },
        { type: 'start', data: values[1][0] },
        { type: 'data', data: values[1][0] },
        { type: 'data', data: values[1][1] },
        { type: 'end', data: values[1][1] },
      ]);
    });
  });
});
