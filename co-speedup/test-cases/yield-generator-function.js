var makePromise = function() {
  return new Promise(function(resolve, reject){
    setTimeout(resolve, 1);
  });
}

generatorFunction = function*() {
  yield makePromise();
};


module.exports = function*() {
  yield generatorFunction;
  yield generatorFunction;
};


