## Performance: Co speedup improvements

This tests **co-original** ([co](https://github.com/visionmedia/co) v3.0.4) against **co-classes** (a refactor of v3.0.4). **co-classes** attempts to use some of the VM-targeted performance optimisations found in [bluebird](https://github.com/petkaantonov/bluebird) to speed up co.

* Promises

## Usage

To run a test:

1. `npm install`
1. `node --harmony runtest.js -t <name-of-file-in-test-cases-folder-without-file-extension>`

To run all tests

1. `./all-tests.sh`

All tests are run with a default concurrency factor of 10000 in order to stress the code and obtain useful results.

## Results (so far)

```bash
// Test platform:
// - Macbook Air 2012 (2 GHz Intel Core i7 + 8GB 1600MHz DDR3 RAM + OS X 10.9 (13A603)) 
// - Node 0.11.10
 

Test: yield-promise (concurrency: 10000)
---------------------------------------------
co-original x 6.73 ops/sec ±4.71% (37 runs sampled)
co-classes x 10.99 ops/sec ±4.46% (55 runs sampled)
Fastest is co-classes


Test: yield-generator-function (concurrency: 10000)
---------------------------------------------
co-original x 4.72 ops/sec ±4.40% (16 runs sampled)
co-classes x 4.90 ops/sec ±2.99% (16 runs sampled)
Fastest is co-classes,co-original


Test: yield-generator (concurrency: 10000)
---------------------------------------------
co-original x 4.89 ops/sec ±2.75% (17 runs sampled)
co-classes x 5.14 ops/sec ±3.19% (17 runs sampled)
Fastest is co-classes,co-original


Test: yield-thunk (concurrency: 10000)
---------------------------------------------
co-original x 11.28 ops/sec ±2.98% (57 runs sampled)
co-classes x 13.81 ops/sec ±1.83% (67 runs sampled)
Fastest is co-classes


Test: yield-object (concurrency: 10000)
---------------------------------------------
co-original x 5.41 ops/sec ±3.41% (18 runs sampled)
co-classes x 5.66 ops/sec ±2.45% (18 runs sampled)
Fastest is co-classes
```

Overall **co-classes** is faster, and especially so when yielding thunks and promises.

## Learnings

* Cannot equal bluebird's performance on yielding promises because Bluebird can simply use its internal API to bypass the normal `.then()` mechanism, etc. Also, having to `bind` a function sucks as it introduces an extra execution level. But `Function.prototype.bind()` is far worse as it needs to check if the function is being instantiated, so what we have here is already the best.

* Having to assume that async calls can return multiple values (i.e. more than 1 result parameter to the callback) means we have to assume a need for the `Array.prototype.slice` method at times. Doing this really slows things down so better to return your async result as a single argument (group things together into an array or object if necessary).


## TODO

* Use V8 flags to determine good/bad performance points in the code, see https://github.com/petkaantonov/bluebird/wiki/Optimization-killers
* Compare memory usage of both versions




