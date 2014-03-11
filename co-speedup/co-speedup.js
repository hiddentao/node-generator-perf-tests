
/**
 * toString() reference.
 */

var toString = Object.prototype.toString;

/**
 * slice() reference.
 */

var slice = Array.prototype.slice;




var bind = function(func, receiver) {
  return function() {
    func.apply(receiver, arguments);
  }
};




/**
 * Check if `obj` is a generator function.
 *
 * @param {Function} obj
 * @return {Boolean}
 * @api private
 */

function isGeneratorFunction(obj) {
  return 'GeneratorFunction' == obj.constructor.name;
}


/**
 * Throw `err` in a new stack.
 *
 * This is used when co() is invoked
 * without supplying a callback, which
 * should only be for demonstrational
 * purposes.
 *
 * @param {Error} err
 * @api private
 */

function error(err) {
  if (!err) return;
  setImmediate(function(){
    throw err;
  });
}



var Coroutine = function(generator) {
  this.gen = generator;
  this.promiseThenB = bind(this.promiseThen, this);
  this.promiseCatchB = bind(this.promiseCatch, this);
  this.handleAsyncResultB = bind(this.handleAsyncResult, this);
}

Coroutine.prototype.run = function(ctx, done) {
  this.ctx = ctx;
  this.done = done;
  this.promiseThen();
}



Coroutine.prototype.tryCatch = function(func, receiver, arg) {
  try {
    return func.call(receiver, arg);
  } catch (err) {
    return err;
  }  
}


Coroutine.prototype.promiseThen = function(value) {
  this.continue(
    this.tryCatch(this.gen.next, this.gen, value)
  );
}


Coroutine.prototype.promiseCatch = function(err) {
  this.continue(
    this.tryCatch(this.gen.throw, this.gen, err)
  );
}

Coroutine.prototype.handleAsyncResult = function(err, value) {
  if (err) {
    this.promiseCatch(err);
  } else {
    // multiple values as result?
    if (1 < arguments.length) {
      value = slice.call(arguments, 1);
    }
    this.promiseThen(value);    
  }
}


Coroutine.prototype.throw = function(err) {
  this.continue(
    this.tryCatch(this.gen.throw, this.gen, err)
  );
}

Coroutine.prototype.executePromise = function(promise) {
  promise.then(this.promiseThenB, this.promiseCatchB);
}


Coroutine.prototype.executeGenerator = function(generator) {
  new Coroutine(generator).run(this.ctx, this.handleAsyncResultB);
}


Coroutine.prototype.executeGeneratorFunction = function(generatorFunction) {
  new Coroutine(generatorFunction.call(this.ctx)).run(this.ctx, this.handleAsyncResultB);
}

Coroutine.prototype.executeThunk = function(thunk) {
  thunk.call(this.ctx, this.handleAsyncResultB);
}

Coroutine.prototype.executeObject = function(obj) {
  /*
  For this one it's clear that we will need to split out the .execute..() methods into another more re-usable class (e.g. Exec) which when 
  given a list of yieldables and non-yieldables will execute them until they all complete and then return the final result.

  Since such a class will contain many similar methods to this class (Coroutine) this one should probably inherit from it and then override 
  where necessary. Specifically, Coroutine should override the .execute() method such that non-yieldable values throw an error (where as 
  in Exec they would simply get returned back to the caller).
   */

  this.handleAsyncResultB(new Error('Not yet implemented'));

}


Coroutine.prototype.execute = function(value) {
  try {

    if (value) {
      // promise
      if ('function' === typeof value.then) {
        this.executePromise(value);
        return;
      } 
      // generator
      else if ('function' === typeof value.next && 'function' == typeof value.throw) {
        this.executeGenerator(value);
        return;
      }
      // is a function
      else if ('function' === typeof value) {
        // generator function
        if (isGeneratorFunction(value)) {
          this.executeGeneratorFunction(value);
          return;
        } 
        // assume it's a thunk
        else {
          this.executeThunk(value);
          return;
        }
      } else if ('object' === typeof value) {
        this.executeObject(value);
      } 
    }

    this.done(new Error('yield a function, promise, generator, array, or object'));      

  } catch (err) {
    var self = this;
    setImmediate(function(){
      self.throw(err);
    });    
  }
}



Coroutine.prototype.continue = function(res) {
  if (res instanceof Error) {
    this.done(res);
    return;
  }

  if (res.done) {
    this.done(null, res.value);
  } else {
    this.execute(res.value);
  }
}




/**
 * Wrap the given generator `fn` and
 * return a thunk.
 *
 * @param {Function} fn
 * @return {Function}
 * @api public
 */

function co(fn) {
  var isGenFun = isGeneratorFunction(fn);

  return function (done) {
    var ctx = this;

    // in toThunk() below we invoke co()
    // with a generator, so optimize for
    // this case
    var gen = fn;

    // we only need to parse the arguments
    // if gen is a generator function.
    if (isGenFun) {
      if (1 < arguments.length) {
        var args = slice.call(arguments), len = args.length;
        var hasCallback = len && 'function' == typeof args[len - 1];
        done = hasCallback ? args.pop() : null;
        gen = fn.apply(ctx, args);
      } else {
        gen = fn.apply(ctx);
      }
    }

    new Coroutine(gen).run(ctx, done || error);
  }
}




module.exports = co;

