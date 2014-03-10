## Performance: Co speedup improvements

We are testing **co original•• (= [co](https://github.com/visionmedia/co) v3.0.4) against **co speedup** (a refactor v3.0.4). **co speedup** attempts to use some of the VM-targeted performance optimisations found in [bluebird](https://github.com/petkaantonov/bluebird) to speed up co.

* Promises

## Usage

Run in this folder:

1. `npm install`
1. `./test.sh`

All tests are run with a default concurrency factor of 10000 in order to stress the code and obtain useful results.

The following is tested:

* yielding promises
* yielding generator functions
* yielding generators

## Results

TODO...



