// ========================================================================
// SCUI.Cleanup
// ========================================================================

sc_require('core');

/**

  This view mixin disconnects bindings upon becoming invisible, and reconnects
  them upon becoming visible again.  At the same time, it fires setup() and
  cleanup() hook methods in case you want to override them and do additional
  setup or cleanup.
  
  This mixin is especially useful for dynamically created views with custom
  bindings and observers, like some of the more complicated collection/list item views that
  are created and destroyed dynamically and come and go often.  This mixin helps
  keep outdated bindings from accumulating in views that are not immediately
  in use.  (Without this fix, the bindings do still fire).

  @Mixin
  @author Jonathan Lewis
  @version FR3
  @since FR3

*/

SCUI.Cleanup = {

  // PUBLIC PROPERTIES

  /**
    @read-only
    True on init and after cleanup() has been called.  False after setup() has been called.
    Setup is triggered by the view becoming visible, cleanup is triggered by its becoming invisible.
  */
  isClean: YES,

  log: NO,

  // PUBLIC METHODS

  /**
    @public
    Override for custom setup.  Called when the view becomes visible.
  */
  setup: function() {
    if (this.log) console.log('%@.setup()'.fmt(this));
  },

  /**
    @public
    Override for custom cleanup.  Called when the view becomes invisible.
  */
  cleanup: function() {
    if (this.log) console.log('%@.cleanup()'.fmt(this));
  },
  
  destroyMixin: function() {
    this._c_cleanupIfNeeded();
    this._c_bindings = null; // destroy our bindings cache
  },
  
  // PRIVATE METHODS

  _c_isVisibleInWindowDidChange: function() {
    if (this.get('isVisibleInWindow')) {
      this._c_setupIfNeeded();
    }
    else {
      this._c_cleanupIfNeeded();
    }
  }.observes('isVisibleInWindow'),

  _c_setupIfNeeded: function() {
    if (this.get('isClean') && this.get('isVisibleInWindow')) { // make sure we only enter once
      this.setup();
      //this._c_connectBindings();
      this.set('isClean', NO);
    }
  },
  
  _c_cleanupIfNeeded: function() {
    if (!this.get('isClean') && !this.get('isVisibleInWindow')) { // make sure we only enter once
      //this._c_disconnectBindings();
      this.cleanup();
      this.set('isClean', YES);
    }
  },
  
  _c_disconnectBindings: function() {
    var bindings = this.get('bindings') || [];
    var len = bindings.get('length');
    var binding;

    for (var i = 0; i < len; i++) {
      binding = bindings.objectAt(i);
      binding.disconnect();
      if (this.log) console.log('### disconnecting %@'.fmt(binding));
    }

    this._c_bindings = bindings.slice();
    this.set('bindings', []);
  },
  
  _c_connectBindings: function() {
    var bindings = this._c_bindings || [];
    var len = bindings.get('length');
    var binding;
    
    for (var i = 0; i < len; i++) {
      binding = bindings.objectAt(i);
      binding.connect();
      if (this.log) console.log('### connecting %@'.fmt(binding));
    }

    this._c_bindings = null;
  },
  
  // PRIVATE PROPERTIES
  
  _c_bindings: null
  
};
