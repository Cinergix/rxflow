import { Observable } from 'rxjs';
import { batch } from './batch';

describe('rxflow', () => {
  describe('batch', () => {
    const TEST_BATCH_TIMEOUT = 50;

    function batchAndGetResult(input: Observable<any>) {
      return batch(TEST_BATCH_TIMEOUT, input).toArray().toPromise();
    }

    it('should return an observables', () => {
      const out = batch(TEST_BATCH_TIMEOUT, Observable.of(null));
      expect(out instanceof Observable).toBe(true);
    });

    describe('single event', () => {
      it('should emit events in S1,E1,N1 order', async () => {
        const val = Math.random();
        const out = await batchAndGetResult(Observable.of(val));
        expect(out).toEqual([
          { type: 'start', event: val },
          { type: 'event', event: val },
          { type: 'end', event: val },
        ]);
      });
    });

    describe('single 2 event batch (sync)', () => {
      it('should emit events in S1,E1,E2,N2 order', async () => {
        const val = [Math.random(), Math.random()];
        const out = await batchAndGetResult(Observable.of(...val));
        expect(out).toEqual([
          { type: 'start', event: val[0] },
          { type: 'event', event: val[0] },
          { type: 'event', event: val[1] },
          { type: 'end', event: val[1] },
        ]);
      });
    });

    describe('2 single event batches (sync)', () => {
      it('should emit events in S1,E1,N1,S2,E2,N2 order', async () => {
        const val = [Math.random(), Math.random()];
        const ob1 = Observable.of(val[0]);
        const ob2 = Observable.of(val[1]).delay(TEST_BATCH_TIMEOUT + 10);
        const out = await batchAndGetResult(ob1.concat(ob2));
        expect(out).toEqual([
          { type: 'start', event: val[0] },
          { type: 'event', event: val[0] },
          { type: 'end', event: val[0] },
          { type: 'start', event: val[1] },
          { type: 'event', event: val[1] },
          { type: 'end', event: val[1] },
        ]);
      });
    });

    describe('multiple 2 event batches (sync)', () => {
      it('should emit events in S1,E1,E2,N2,S3,E3,E4,N4 order', async () => {
        const val = [Math.random(), Math.random(), Math.random(), Math.random()];
        const ob1 = Observable.from(val.slice(0, 2));
        const ob2 = Observable.from(val.slice(2)).delay(TEST_BATCH_TIMEOUT + 10);
        const out = await batchAndGetResult(ob1.concat(ob2));
        expect(out).toEqual([
          { type: 'start', event: val[0] },
          { type: 'event', event: val[0] },
          { type: 'event', event: val[1] },
          { type: 'end', event: val[1] },
          { type: 'start', event: val[2] },
          { type: 'event', event: val[2] },
          { type: 'event', event: val[3] },
          { type: 'end', event: val[3] },
        ]);
      });
    });
  });
});
