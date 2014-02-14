Some performance tests for using Generators in node.js. All tests require **node v0.11.2 or above**.

## Usage

1. `npm install`
1. `node --harmony <test file.js>`

## Results

### Generator delegation

https://github.com/hiddentao/generator-performance-tests/blob/master/perf-generator-delegation.js

This tests the performance impact fro using the `yield *` operator.

```
// Macbook Air 2012 (2 GHz Intel Core i7 + 8GB 1600MHz DDR3 RAM + OS X 10.9 (13A603))
// Node 0.11.10

Without delegation x 693 ops/sec ±0.98% (23 runs sampled)
With delegation x 683 ops/sec ±1.23% (20 runs sampled)
```

Browser version of this test: http://jsperf.com/generator-delegation

```
// Macbook Air 2012 (2 GHz Intel Core i7 + 8GB 1600MHz DDR3 RAM + OS X 10.9 (13A603)) 
// Firefox Nightly 30.0a1

Without delegation x 119,272 ops/sec ±2.85%
With delegation x 69,286 ops/sec ±5.17%
```




### Bluebird vs co

https://github.com/hiddentao/generator-performance-tests/blob/master/perf-co-vs-bluebird.js

This test tests bluebird's [`Promise.spawn`](https://github.com/petkaantonov/bluebird/blob/master/API.md#promisespawngeneratorfunction-generatorfunction---promise) against [`co`](https://github.com/visionmedia/co)


```
// Macbook Air 2012 (2 GHz Intel Core i7 + 8GB 1600MHz DDR3 RAM + OS X 10.9 (13A603)) 
// Node 0.11.10

Bluebird-Promise.spawn x 155 ops/sec ±0.86% (84 runs sampled)
co x 156 ops/sec ±0.77% (83 runs sampled)
```

Browser version of this test: http://jsperf.com/generator-iteration-co-vs-bluebird

```
// Macbook Air 2012 (2 GHz Intel Core i7 + 8GB 1600MHz DDR3 RAM + OS X 10.9 (13A603)) 
// Firefox Nightly 30.0a1

Bluebird-Promise.spawn x 50.95 ops/sec ±0.46%
co x 51.17 ops/sec ±0.54%
```



