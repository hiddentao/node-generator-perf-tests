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
 * Expose `co`.
 */

module.exports = co;



var Coroutine = function(generator) {
  this.gen = generator;
  this.nextB = bind(this.next, this);
  this.throwB = bind(this.throw, this);
}

Coroutine.prototype.run = function(ctx, done, errorCb) {
  this.ctx = ctx;
  this.done = done;
  this.errorCb = errorCb;
  this.next();
}



Coroutine.prototype.success = function(result) {
  if (!this.errorCb) {
    this.done(null, result);
  } else {
    this.done(result);
  }
}



Coroutine.prototype.error = function(err) {
  if (!this.errorCb) {
    this.done(err);
  } else {
    this.errorCb(err);
  }
}



Coroutine.prototype.tryCatch = function(func, receiver, arg) {
  try {
    return func.call(receiver, arg);
  } catch (err) {
    return err;
  }  
}


Coroutine.prototype.next = function(value) {
  // multiple values as result?
  if (1 < arguments.length) {
    value = slice.call(arguments, 1);
  }

  this.continue(
    this.tryCatch(this.gen.next, this.gen, value)
  );
}


Coroutine.prototype.throw = function(err) {
  this.continue(
    this.tryCatch(this.gen.throw, this.gen, err)
  );
}



Coroutine.prototype.executePromise = function(promise) {
  promise.then(this.nextB, this.throwB);
}


Coroutine.prototype.executeGenerator = function(generator) {
  new Coroutine(generator).run(thix.ctx, this.nextB, this.throwB);
}



Coroutine.prototype.execute = function(value) {
  var self = this;

  try {
    if (isPromise(value)) {
      this.executePromise(value);
      return;
    }     

    if (isGenerator(value)) {
      this.executeGenerator(value);
      return;
    }     

  } catch (err) {
    setImmediate(function(){
      self.throw(err);
    });    
    return;
  }

  this.error(new Error('yield a function, promise, generator, array, or object'));  
}



Coroutine.prototype.continue = function(res) {
  var self = this;

  if (res instanceof Error) {
    self.error(res);
    return;
  }

  if (res.done) {
    self.success(res.value);
  } else {
    self.execute(res.value);

    // // run
    // if ('function' == typeof res.value) {
    //   var called = false;
    //   try {
    //     res.value.call(this.ctx, function(err){
    //       if (called) return;
    //       called = true;
    //       if (err) {
    //         self.throw(err);
    //       } else {
    //         self.next.apply(self, slice.call(arguments, 1));            
    //       }
    //     });
    //   } catch (e) {
    //     setImmediate(function(){
    //       if (called) return;
    //       called = true;
    //       self.throw(e);
    //     });
    //   }
    //   return;
    // }

    // // invalid
    // next(new Error('yield a function, promise, generator, array, or object'));
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



/**
 * Coroutinenvert `obj` into a normalized thunk.
 *
 * @param {Mixed} obj
 * @param {Mixed} ctx
 * @return {Function}
 * @api private
 */

function toThunk(obj, ctx) {
  // if (Array.isArray(obj)) {
  //   return objectToThunk.call(ctx, obj);
  // }

  // if (isGeneratorFunction(obj)) {
  //   return co(obj.call(ctx));
  // }

  if (isGenerator(obj)) {
    return co(obj);
  }

  if (isPromise(obj)) {
    return promiseToThunk(obj);
  }

  // if ('function' == typeof obj) {
  //   return obj;
  // }

  // if (obj && 'object' == typeof obj) {
  //   return objectToThunk.call(ctx, obj);
  // }

  return obj;
}

/**
 * Coroutinenvert an object of yieldables to a thunk.
 *
 * @param {Object} obj
 * @return {Function}
 * @api private
 */

function objectToThunk(obj){
  var ctx = this;

  return function(done){
    var keys = Object.keys(obj);
    var pending = keys.length;
    var results = new obj.constructor();
    var finished;

    if (!pending) {
      setImmediate(function(){
        done(null, results)
      });
      return;
    }

    for (var i = 0; i < keys.length; i++) {
      run(obj[keys[i]], keys[i]);
    }

    function run(fn, key) {
      if (finished) return;
      try {
        fn = toThunk(fn, ctx);

        if ('function' != typeof fn) {
          results[key] = fn;
          return --pending || done(null, results);
        }

        fn.call(ctx, function(err, res){
          if (finished) return;

          if (err) {
            finished = true;
            return done(err);
          }

          results[key] = res;
          --pending || done(null, results);
        });
      } catch (err) {
        finished = true;
        done(err);
      }
    }
  }
}

/**
 * Coroutinenvert `promise` to a thunk.
 *
 * @param {Object} promise
 * @return {Function}
 * @api private
 */

function promiseToThunk(promise) {
  return function(fn){
    promise.then(function(res) {
      fn(null, res);
    }, fn);
  }
}

/**
 * Check if `obj` is a promise.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isPromise(obj) {
  return obj && 'function' == typeof obj.then;
}

/**
 * Check if `obj` is a generator.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */

function isGenerator(obj) {
  return obj && 'function' == typeof obj.next && 'function' == typeof obj.throw;
}

/**
 * Check if `obj` is a generator function.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */

function isGeneratorFunction(obj) {
  return obj && obj.constructor && 'GeneratorFunction' == obj.constructor.name;
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
