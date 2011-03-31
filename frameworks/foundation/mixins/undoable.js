// ==========================================================================
// SCUI.Undoable
// ==========================================================================

/**
  @namespace
  
  The SCUI.Undoable mixin makes it easy to automatically register undo operations
  on your view whenever relevant properties change.  To use this mixin, include 
  it in your view and then add the names of the properties you want to trigger 
  an undo register when they change..
  
  h2. Example
  
  {{{
    MyApp.MyViewClass = SC.View.extend(SCUI.Undoable, { 
      undoableProperties: 'title height width'.w(),
      ...
    });
  }}}
*/
SCUI.Undoable = {
  
  /** 
    Add an array with the names of any property on the view that should register 
    an undo of the same property on the undo manager for your view. 
    
    @property {Array}
  */
  undoableProperties: [],

  /** @private
    Register undoable property observer...
  */
  initMixin: function() {
    var valueCache, up = this.get('undoableProperties') ; 
    var idx = up.length ;
    valueCache = this._undoableProperty_didChange_valueCache = {};
    while (--idx >= 0) {
      var key = up[idx];
      this.addObserver(key, this, this.undoablePropertyDidChange);
      valueCache[key] = this.get(key);
    }
  },
  
  /**
   * Remove undoable property observer...
   * @private
   */
  destroyMixin: function () {
    var up = this.get('undoableProperties');
    var idx = up.length;
    while (--idx >= 0) {
      var key = up[idx];
      this.removeObserver(key, this, this.undoablePropertyDidChange);
    } 
    
    this._undoableProperty_didChange_valueCache = null;
  },

  /**
    This method is invoked whenever an undoable property changes.  It will register 
    the undo of the value that the property was set to.
  */
  undoablePropertyDidChange: function(target, key) {
    var newValue = this.get(key);
    var valueCache = this._undoableProperty_didChange_valueCache ;
    var oldValue = valueCache[key];
    
    if (this.undoablePropertyShouldRegisterUndo(key, oldValue, newValue)) {
      // register undo operation with old value
      var undoManager = this.get('undoManager');
      if (undoManager) {
        undoManager.registerUndo(function() {
          this.set(key, oldValue);
        }, this);
      }
      // update the cache
      valueCache[key] = newValue; 
    }
  },
  
  /**
  
    Called just before registering the undo operation to give you and 
    opportunity to decide if the register should be allowed.  Override
    for more fine-grained control
    
    The default implementation returns YES if the value changes.
    
    @param key {String} the property to register undo
    @param oldValue old value of property
    @param newValue new value of property
    @returns {Boolean} YES to alow, NO to prevent it
  */
  undoablePropertyShouldRegisterUndo: function(key, oldValue, newValue) {
    return (newValue !== oldValue);
  }
};
