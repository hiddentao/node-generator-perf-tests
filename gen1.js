/**
 * Custom co-routine
 */

var tryCatch = function(func, receiver, arg) {
  try {
    return func.call(receiver, arg);
  } catch (genErr) {
    return genErr;
  }  
};



var gen = function(generatorFunction) {

  var Coroutine = function(generatorFunction) {
    this.generatorFunction = generatorFunction;
  };

  Coroutine.prototype.run = function(done) {
    this.generator = this.generatorFunction.call(this.generatorFunction);
    this.done = done;
    this.generatorFunction = void 0;
    this.next(void 0);
  }

  Coroutine.prototype.next = function(value) {
    this.continue(
      tryCatch(this.generator.next, this.generator, value)
    );
  };

  Coroutine.prototype.throw = function(err) {
    this.continue(
      tryCatch(this.generator.throw, this.generator, err)
    );
  };

  Coroutine.prototype.continue = function(result) {
    if (result instanceof Error) {
      this.generator = void 0;
      this.done(result);
      return;
    }

    var value = result.value;

    if (true === result.done) {
      this.generator = void 0;
      this.done(value);
    } else {
      value._then(this.next, this.throw, void 0, this);
    }
  };

  var coRoutine = new Coroutine(generatorFunction);
  return function(done) {
    coRoutine.run(done);
  } 
};


module.exports = gen;

