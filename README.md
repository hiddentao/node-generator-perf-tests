Some performance tests for using Generators in node.js. All tests require **node v0.11.2 or above**.

## Usage

1. `npm install`
1. `node --harmony <test file.js>`

## Results

### Generator delegation

https://github.com/hiddentao/generator-performance-tests/blob/master/perf-generator-delegation.js

This tests the performance impact fro using the `yield *` operator.

```
// Test ran on Macbook Air 2012 (2 GHz Intel Core i7 + 8GB 1600MHz DDR3 RAM + OS X 10.9 (13A603))

Without delegation x 649 ops/sec ±1.24% (37 runs sampled)
With delegation x 625 ops/sec ±1.94% (20 runs sampled)
Fastest is Without delegation
```

Browser version of this test: http://jsperf.com/generator-delegation


### Bluebird vs co

https://github.com/hiddentao/generator-performance-tests/blob/master/perf-co-vs-bluebird.js

This test tests bluebird's [`Promise.spawn`](https://github.com/petkaantonov/bluebird/blob/master/API.md#promisespawngeneratorfunction-generatorfunction---promise) against [`co`](https://github.com/visionmedia/co)


```
// Test ran on Macbook Air 2012 (2 GHz Intel Core i7 + 8GB 1600MHz DDR3 RAM + OS X 10.9 (13A603))

Bluebird-Promise.spawn x 155 ops/sec ±0.86% (84 runs sampled)
co x 156 ops/sec ±0.77% (83 runs sampled)
Fastest is co,Bluebird-Promise.spawn
```

Browser version of this test: http://jsperf.com/generator-iteration-co-vs-bluebird


