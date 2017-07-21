import { Observable } from 'rxjs';
import { batch } from './batch';

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
      .map((group, idx) => Observable.from(group).delay(idx * TEST_BATCH_TIMEOUT + 10))
      .reduce((merged, obs) => merged.concat(obs));
    return [values, observable];
  }

  function batchAndGetResult(input: Observable<any>) {
    return batch(TEST_BATCH_TIMEOUT, input).toArray().toPromise();
  }

  it('should return an observables', () => {
    const out = batch(TEST_BATCH_TIMEOUT, Observable.of(null));
    expect(out instanceof Observable).toBe(true);
  });

  describe('single event', () => {
    it('should emit events in S1,E1,N1 order', async () => {
      const [values, observable] = createTestObservables(1);
      const out = await batchAndGetResult(observable);
      expect(out).toEqual([
        { type: 'start', event: values[0][0] },
        { type: 'event', event: values[0][0] },
        { type: 'end', event: values[0][0] },
      ]);
    });
  });

  describe('single 2 event batch (sync)', () => {
    it('should emit events in S1,E1,E2,N2 order', async () => {
      const [values, observable] = createTestObservables(2);
      const out = await batchAndGetResult(observable);
      expect(out).toEqual([
        { type: 'start', event: values[0][0] },
        { type: 'event', event: values[0][0] },
        { type: 'event', event: values[0][1] },
        { type: 'end', event: values[0][1] },
      ]);
    });
  });

  describe('2 single event batches (sync)', () => {
    it('should emit events in S1,E1,N1,S2,E2,N2 order', async () => {
      const [values, observable] = createTestObservables(1, 1);
      const out = await batchAndGetResult(observable);
      expect(out).toEqual([
        { type: 'start', event: values[0][0] },
        { type: 'event', event: values[0][0] },
        { type: 'end', event: values[0][0] },
        { type: 'start', event: values[1][0] },
        { type: 'event', event: values[1][0] },
        { type: 'end', event: values[1][0] },
      ]);
    });
  });

  describe('multiple 2 event batches (sync)', () => {
    it('should emit events in S1,E1,E2,N2,S3,E3,E4,N4 order', async () => {
      const [values, observable] = createTestObservables(2, 2);
      const out = await batchAndGetResult(observable);
      expect(out).toEqual([
        { type: 'start', event: values[0][0] },
        { type: 'event', event: values[0][0] },
        { type: 'event', event: values[0][1] },
        { type: 'end', event: values[0][1] },
        { type: 'start', event: values[1][0] },
        { type: 'event', event: values[1][0] },
        { type: 'event', event: values[1][1] },
        { type: 'end', event: values[1][1] },
      ]);
    });
  });
});
