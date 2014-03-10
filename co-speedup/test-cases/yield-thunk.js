var makeThunk = function() {
  return function(done) {
    setTimeout(done, 1);
  }
}

module.exports = function*() {
  yield makeThunk();
  yield makeThunk();
};


