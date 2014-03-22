var makeThunk = function() {
  return function(done) {
    setTimeout(done, 1);
  }
}

generatorFunction = function*() {
  yield makePromise();
};

module.exports = function*() {
  yield makeThunk();
  yield makeThunk();
};
