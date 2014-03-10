## Performance: Co speedup improvements

This tests **co original** (= [co](https://github.com/visionmedia/co) v3.0.4) against **co speedup** (a refactor v3.0.4). **co speedup** attempts to use some of the VM-targeted performance optimisations found in [bluebird](https://github.com/petkaantonov/bluebird) to speed up co.

* Promises

## Usage

To run a test:

1. `npm install`
1. `node --harmony runtest.js -t <name-of-file-in-test-cases-folder-without-file-extension>`

To run all tests

1. `./all-tests.sh`

All tests are run with a default concurrency factor of 10000 in order to stress the code and obtain useful results.


## Results

TODO...



