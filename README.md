Some performance tests for using Generators in node.js. All tests require **node v0.11.2 or above**.

## Usage

1. `npm install`
1. 'node --harmony <test file.js>'

## Results

### Generator delegation

https://github.com/hiddentao/generator-performance-tests/blob/master/perf-delegated-generators.js

This tests the performance impact fro using the `yield *` operator.

```
// Test ran on Macbook Air 2012 (2 GHz Intel Core i7 + 8GB 1600MHz DDR3 RAM + OS X 10.9 (13A603))
Non-delegation x 683 ops/sec ±1.01% (24 runs sampled)

Delegation x 665 ops/sec ±0.95% (21 runs sampled)
Fastest is Non-delegation
```

Browser-version of this test available at http://jsperf.com/generator-delegation


### Bluebird vs co

https://github.com/hiddentao/generator-performance-tests/blob/master/perf-co-vs-bluebird.js

This test tests bluebird's [`Promise.spawn`](https://github.com/petkaantonov/bluebird/blob/master/API.md#promisespawngeneratorfunction-generatorfunction---promise) against [`co`](https://github.com/visionmedia/co)


```
// Test ran on Macbook Air 2012 (2 GHz Intel Core i7 + 8GB 1600MHz DDR3 RAM + OS X 10.9 (13A603))

Bluebird-Promise.spawn x 155 ops/sec ±0.84% (82 runs sampled)
co x 156 ops/sec ±0.85% (83 runs sampled)
Fastest is co,Bluebird-Promise.spawn
```


