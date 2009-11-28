// ==========================================================================
// SCUI.Recurrent
// ==========================================================================

/**
  @namespace
  
  Implements a SC.Timer pool for complex validation and function invokation
  
  @author: Evin Grano
  @version: 0.5
  @since: 0.5
*/
SCUI.RECUR_ONCE = 'once';
SCUI.RECUR_REPEAT = 'repeat';
SCUI.RECUR_SCHEDULE = 'schedule';
SCUI.RECUR_ALWAYS = 'always';

SCUI.Recurrent = {
  
  isRecurrent: YES,
  
  _timer_pool: {},
  _guid_for_timer: 1,
  
  /*
    Register a single fire of function with: fireOnce(methodName, interval, *validateMethodName, *args)
    
    @param methodName,
    @param interval (in msec),
    @param validateMethodName (*optional, but must be set if using args),
    @param args (*optional)
    @return name to cancel
  */
  fireOnce: function(methodName, interval, validateMethodName){
    if (interval === undefined) interval = 1 ;
    var f = methodName, valFunc = validateMethodName, args, func;
    
    // Check to see if there is a validating function
    if (!validateMethodName) valFunc = function(){ return YES; };
    if (SC.typeOf(validateMethodName) === SC.T_STRING) valFunc = this[validateMethodName];
    
    // name 
    var timerName = this._name_builder(SCUI.RECUR_ONCE, methodName);
    
    // if extra arguments were passed - build a function binding.
    if (arguments.length > 3) {
      args = SC.$A(arguments).slice(3);
      if (SC.typeOf(f) === SC.T_STRING) f = this[methodName] ;
      func = f ;
      f = function() {
        delete this._timer_pool[timerName];
        if (valFunc.call(this)) return func.apply(this, args); 
      } ;
    }

    // schedule the timer
    var timer = SC.Timer.schedule({ target: this, action: f, interval: interval });
    
    this._timer_pool[timerName] = timer;
    return timerName;
  },
  
  _name_builder: function(type, method){
    var name ="%@_%@_%@".fmt(type, method, this._guid_for_timer);
    this._guid_for_timer += 1;
    return name;
  }
  
};