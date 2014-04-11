## Performance: Co speedup improvements

This tests **co-original** ([co](https://github.com/visionmedia/co) v3.0.5) against **co-classes** (a refactor using OOP). **co-classes** attempts to use some of the VM-targeted performance optimisations found in [bluebird](https://github.com/petkaantonov/bluebird) to speed up co.

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
co-original x 7.13 ops/sec ±2.61% (39 runs sampled)
co-classes x 11.25 ops/sec ±3.25% (57 runs sampled)
Fastest is co-classes


Test: yield-generator-function (concurrency: 10000)
---------------------------------------------
co-original x 4.05 ops/sec ±1.81% (15 runs sampled)
co-classes x 4.90 ops/sec ±2.10% (17 runs sampled)
Fastest is co-classes


Test: yield-generator (concurrency: 10000)
---------------------------------------------
co-original x 4.11 ops/sec ±2.41% (15 runs sampled)
co-classes x 4.79 ops/sec ±3.17% (16 runs sampled)
Fastest is co-classes


Test: yield-thunk (concurrency: 10000)
---------------------------------------------
co-original x 8.37 ops/sec ±3.69% (45 runs sampled)
co-classes x 12.75 ops/sec ±4.21% (64 runs sampled)
Fastest is co-classes


Test: yield-object (concurrency: 10000)
---------------------------------------------
co-original x 4.83 ops/sec ±3.09% (16 runs sampled)
co-classes x 5.64 ops/sec ±4.18% (18 runs sampled)
Fastest is co-classes
```

Overall **co-classes** is faster, and especially so when yielding thunks and promises.

## Learnings

* Cannot equal bluebird's performance on yielding promises because Bluebird can simply use its internal API to bypass the normal `.then()` mechanism, etc. Also, having to `bind` a function sucks as it introduces an extra execution level. But `Function.prototype.bind()` is far worse as it needs to check if the function is being instantiated, so what we have here is already the best.

* Having to assume that async calls can return multiple values (i.e. more than 1 result parameter to the callback) means we have to assume a need for the `Array.prototype.slice` method at times. Doing this really slows things down so better to return your async result as a single argument (group things together into an array or object if necessary).

* Having additional functions within the `Coroutine` class impacts performance. If we have a function 'A' which never gets called but does internally call function 'B' which does get called then the VM seems to take 'A' into consideration. Further investigation required.

## TODO

* Use V8 flags to determine good/bad performance points in the code, see https://github.com/petkaantonov/bluebird/wiki/Optimization-killers
* Compare memory usage of both versions
