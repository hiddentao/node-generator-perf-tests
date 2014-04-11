
/**
 * toString() reference.
 */

var toString = Object.prototype.toString;

/**
 * slice() reference.
 */

var slice = Array.prototype.slice;



/**
 * Bind given function to given receiver.
 * @param  {Function} func
 * @param  {Object} receiver
 * @return {Function}
 */
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
 * Check if `obj` is a plain javascript object or array.
 *
 * @param {Function} obj
 * @return {Boolean}
 * @api private
 */
function isPlainObjectOrArray(obj) {
  return 'object' === typeof obj &&
    (obj.constructor.prototype === Array.prototype ||
        obj.constructor.prototype.hasOwnProperty('isPrototypeOf')
    );
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




// ------------------------------------------------------------------------- //
//
// The main class
//
// ------------------------------------------------------------------------- //




/**
 * Handle a generator.
 * @param {Object} generator A generator instance to iterate over.
 */
var Coroutine = function(generator) {
  this.gen = generator;
  this.handleAsyncResultB = bind(this.handleAsyncResult, this);
  this.handleAsyncErrorB = bind(this.handleAsyncError, this);
  this.handleThunkResultB = bind(this.handleThunkResult, this);
}

/**
 * @param {Function} successCallback Used internally for performance reasons
 */
Coroutine.prototype.run = function(ctx, callback, successCallback) {
  this.ctx = ctx;

  this.callback = callback;
  this.successCallback = successCallback;

  this.finished = false;
  this.handleAsyncResult();
}


Coroutine.prototype.done = function(err, returnValue) {
  this.finished = true;

  try {
    if (!err && this.successCallback) {
      this.successCallback(returnValue);
    } else {
      this.callback(err, returnValue);
    }
  } catch (e) {
    error(e);
  }
}


Coroutine.prototype.continue = function(res) {
  if (res instanceof Error) {
    this.done(res);
    return;
  }

  if (!res.done) {
    this.execute(res.value);
  } else {
    this.done(null, res.value);
  }
}



Coroutine.prototype.tryCatch = function(func, receiver, arg) {
  try {
    return func.call(receiver, arg);
  } catch (err) {
    return err;
  }
}


Coroutine.prototype.throw = function(err) {
  this.continue(
    this.tryCatch(this.gen.throw, this.gen, err)
  );
}


Coroutine.prototype.handleAsyncResult = function(value) {
  this.continue(
    this.tryCatch(this.gen.next, this.gen, value)
  );
}


Coroutine.prototype.handleAsyncError = function(err) {
  this.continue(
    this.tryCatch(this.gen.throw, this.gen, err)
  );
}


Coroutine.prototype.executePromise = function(promise) {
  promise.then(this.handleAsyncResultB, this.handleAsyncErrorB);
}

Coroutine.prototype.executeGenerator = function(generator) {
  new Coroutine(generator).run(
    this.ctx, this.handleAsyncErrorB, this.handleAsyncResultB);
}

Coroutine.prototype.executeObject = function(obj) {
  new CoGroup(obj).run(this.ctx,
    this.handleAsyncErrorB, this.handleAsyncResultB);
}

Coroutine.prototype.executeThunk = function(thunk) {
  thunk.call(this.ctx, this.handleThunkResultB);
}
Coroutine.prototype.handleThunkResult = function(err, value1) {
  if (err) {
    this.handleAsyncError(err);
  } else {
    if (2 < arguments.length) {
      this.handleAsyncResult(slice.call(arguments, 1));
    } else {
      this.handleAsyncResult(value1);
    }
  }
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
          this.executeGenerator(value.call(this.ctx));
          return;
        }
        // assume it's a thunk
        else {
          this.executeThunk(value);
          return;
        }
      } else if (isPlainObjectOrArray(value)) {
        this.executeObject(value);
        return;
      }
    }

    throw new Error('yield a function, promise, generator, array, or object');

  } catch (err) {
    var self = this;
    setImmediate(function(){
      if (self.finished) return;

      self.throw(err);
    });
  }
}






// ------------------------------------------------------------------------- //
//
// Handle a collection of yieldables in parallel
//
// This class has many similar methods to Coroutine, yet they are subtly
// different as in this one we need to know which key each result is
// associated with, which requires the use of closures, which slows
// things down.
//
// ------------------------------------------------------------------------- //




/**
 * Handle a group of yieldables in parallel.
 * @param {Object} yieldables key-value pairs representing yieldables
 */
var CoGroup = function(yieldables) {
  this.yieldables = yieldables;
}


CoGroup.prototype.done = function(err) {
  this.finished = true;

  if (!err && this.successCallback) {
    this.successCallback(this.results);
  } else {
    this.callback(err, this.results);
  }
}


CoGroup.prototype.run = function(ctx, callback, successCallback) {
  this.ctx = ctx;
  this.callback = callback;
  this.successCallback = successCallback;

  this.finished = false;
  this.results = new this.yieldables.constructor();

  var keys = Object.keys(this.yieldables);

  if (!keys.length) {
    var self = this;

    setImmediate(function(){
      self.done();
    });
    return;
  }

  this.pendingYields = keys.length;

  for (var i = 0; i < keys.length; i++) {
    if (this.finished) return;

    this.execute(keys[i], this.yieldables[keys[i]]);
  }
}


CoGroup.prototype.setValue = function(key, value) {
  this.results[key] = value;
  --this.pendingYields || this.done();
}


CoGroup.prototype.executePromise = function(key, promise) {
  var self = this;

  promise.then(
    function(res) {
      self.setValue(key, res);
    },
    function(err) {
      self.done(err);
    }
  );
}


CoGroup.prototype.executeGenerator = function(key, generator) {
  var self = this;

  new Coroutine(generator).run(this.ctx, function(err, result) {
    if (err) return self.done(err);

    self.setValue(key, result);
  });
}


CoGroup.prototype.executeThunk = function(key, thunk) {
  var self = this;

  thunk.call(this.ctx, function(err, result) {
    if (err) return self.done(err);

    self.setValue(key, result);
  });
}


CoGroup.prototype.executeObject = function(key, obj) {
  var self = this;

  new CoGroup(obj).run(this.ctx, function(err, result) {
    if (err) return self.done(err);

    self.setValue(key, result);
  });
}


CoGroup.prototype.execute = function(key, value) {
  try {

    // promise
    if ('function' === typeof value.then) {
      this.executePromise(key, value);
    }
    // generator
    else if ('function' === typeof value.next && 'function' == typeof value.throw) {
      this.executeGenerator(key, value);
    }
    // is a function
    else if ('function' === typeof value) {
      // generator function
      if (isGeneratorFunction(value)) {
        this.executeGenerator(key, value.call(this.ctx));
      }
      // assume it's a thunk
      else {
        this.executeThunk(key, value);
      }
    } else if (isPlainObjectOrArray(value)) {
      this.executeObject(key, value);
    } else {
      this.setValue(key, value);
    }

  } catch (err) {
    var self = this;
    setImmediate(function(){
      if (self.finished) return;

      self.done(err);
    });
  }
}




// ------------------------------------------------------------------------- //
//
// The main entry point
//
// ------------------------------------------------------------------------- //




/**
 * Wrap the given generator `fn` and
 * return a thunk.
 *
 * @param {Function} fn
 * @return {Function}
 * @api public
 */

module.exports = function(fn) {
  var isGenFun = isGeneratorFunction(fn);

  return function (done) {
    var ctx = this;

    // assume a generator has been passed in
    var gen = fn;

    // we only need to parse the arguments
    // if gen is a generator function.
    if (isGenFun) {
      var len = arguments.length;

      if (1 < len) {
        var args = slice.call(arguments);
        var hasCallback = 'function' == typeof args[len - 1];
        done = hasCallback ? args.pop() : error;
        gen = fn.apply(ctx, args);
      } else {
        if (done && 'function' === typeof done) {
          gen = fn.call(ctx);
        } else {
          gen = fn.call(ctx, done);  // done is probably a parameter
          done = error;
        }
      }
    }

    new Coroutine(gen).run(ctx, done || error);
  }
}
