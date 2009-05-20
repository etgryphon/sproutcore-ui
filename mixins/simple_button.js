// ==========================================================================
// Orion.SimpleButton
// ==========================================================================

sc_require('core');

/** @class
  
  Mixin to allow for simple button actions...
  
  @author Evin Grano
  @version 0.1
  @since 0.1
*/
SCUI.SimpleButton = {
/* SimpleButton Mixin */
  target: null,
  action: null,
  isStated: NO,
  _state: NO,
  stateClass: 'state',
  
  _isMouseDown: NO, 

  /** @private 
    On mouse down, set active only if enabled.
  */    
  mouseDown: function(evt) {
    if (!this.get('isEnabled')) return YES ; // handled event, but do nothing
    this.set('isActive', YES);
    this._isMouseDown = YES;
    return YES ;
  },

  /** @private
    Remove the active class on mouseOut if mouse is down.
  */  
  mouseExited: function(evt) {
    if (this._isMouseDown) this.set('isActive', NO);
    return YES;
  },

  /** @private
    If mouse was down and we renter the button area, set the active state again.
  */  
  mouseEntered: function(evt) {
    this.set('isActive', this._isMouseDown);
    return YES;
  },

  /** @private
    ON mouse up, trigger the action only if we are enabled and the mouse was released inside of the view.
  */  
  mouseUp: function(evt) {
    if (this._isMouseDown) this.set('isActive', NO); // track independently in case isEnabled has changed
    this._isMouseDown = false;
    // Trigger the action
    var target = this.get('target') || null;
    var action = this.get('action');
    if (target && action){
      this.getPath('pane.rootResponder').sendAction(action, target, this, this.get('pane'));
    }
    if (this.get('isStated')) this._state = !this._state;
    return true ;
  },
  
  renderMixin: function(context, firstTime){
    if (this.get('isStated'))
    {
      var stateClass = this.get('stateClass');
      context.setClass(stateClass, this._state); // addClass if YES, removeClass if NO
    }
  }
  
};
