var Benchmark = require('benchmark'),
  co = require('co'),
  Promise = require('bluebird');

var tools = require('./tools');


setTimeoutThunk = function(ms) {
  return function(cb){
    setTimeout(cb, ms);
  };
};


var delegated = function*() {
  yield setTimeoutThunk(1);
  yield setTimeoutThunk(1);
};

var delegator = function*() {
  yield* delegated();
};



var suite = new Benchmark.Suite;

// add tests
suite.add('Without delegation', {
  defer: true,
  fn: function(deferred) {
    tools.run(function(cb) {
      var gen = delegated(),
        done = false;

      while (!done) {
        done = gen.next().done;
      }

      cb();
    }, function() {
      deferred.resolve();
    });
  }
})
.add('With delegation', {
  defer: true,
  fn: function(deferred) {
    tools.run(function(cb) {
      var gen = delegator(),
        done = false;

      while (!done) {
        done = gen.next().done;
      }

      cb();
    }, function() {
      deferred.resolve();
    });
  }
})
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').pluck('name'));
})
.run({ 'async': true });