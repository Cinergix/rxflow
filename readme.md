# rxflow

> status: experimental

## batch
Takes an observable as input and groups emits made with the observable into batches by time.

# callp
Takes an array of observable thunks and calls runs then concurrently. Returns an array of latest values after all observables resolve.

# calls
Takes an array of observable thunks and calls them one sequentially. Each step receives the result of previous step as input.

# order
Takes an observable and an order test function and returns an observable which orders values emitted in input observable.

## TODO

- improve the readme