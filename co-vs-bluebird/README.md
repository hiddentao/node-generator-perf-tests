## Performance: Co vs Bluebird

This tests [co](https://github.com/visionmedia/co) against [bluebird](https://github.com/petkaantonov/bluebird) in terms of which one is faster at iterating through a generator function. 

## Usage

```bash
  Usage: runtest.js [options]

  Options:

    -h, --help               output usage information
    -c, --concurrency [num]  Concurrency factor [10000]

```

## Browser version of test

* http://jsperf.com/generator-iteration-co-vs-bluebird/2

## Results

```
// Test device: Macbook Air 2012 (2 GHz Intel Core i7 + 8GB 1600MHz DDR3 RAM + OS X 10.9 (13A603)) 
 // Node 0.11.10
 
$ node --harmony perf-co-vs-bluebird.js -c 10000
Concurrency factor: 10000
Bluebird-Promise.spawn x 16.02 ops/sec ±3.42% (78 runs sampled)
co x 6.86 ops/sec ±3.23% (37 runs sampled)
Bluebird-Promise.coroutine (prepared) x 16.78 ops/sec ±2.22% (80 runs sampled)
co (prepared) x 7.39 ops/sec ±3.50% (40 runs sampled)
```

Blog post at [http://www.hiddentao.com/archives/2014/02/14/javascript-generator-delegation-and-coroutine-performance/](http://www.hiddentao.com/archives/2014/02/14/javascript-generator-delegation-and-coroutine-performance/)



