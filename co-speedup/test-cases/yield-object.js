var makeThunk = function() {
  return function(done) {
    setTimeout(done, 1);
  }
}

var makePromise = function() {
  return new Promise(function(resolve, reject){
    setTimeout(resolve, 1);
  });
};

var genFunction = function*() {
  yield {
    a: 1,
    b: makeThunk(),
    c: makePromise(),
    d: genFunction,
    e: genFunction()
  };
};


module.exports = genFunction;