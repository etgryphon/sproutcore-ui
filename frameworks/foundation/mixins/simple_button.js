/*globals SCUI*/
/*jslint evil: true */

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
  hasState: NO,
  hasHover: NO,
  inState: NO,
  _hover: NO,
  stateClass: 'state',
  hoverClass: 'hover',
  activeClass: 'active', // Used to show the button as being active (pressed)
  alwaysEnableToolTip: NO,  
  _isMouseDown: NO,
  _isContinuedMouseDown: NO, // This is so we can maintain a held state in the case of mousing out behavior
  _canFireAction: NO,
  
  displayProperties: ['inState', 'isEnabled'],

  /** @private 
    On mouse down, set active only if enabled.
  */    
  mouseDown: function(evt) {
    //console.log('SimpleButton#mouseDown()...');
    if (!this.get('isEnabledInPane')) return YES ; // handled event, but do nothing
    this._isMouseDown = this._isContinuedMouseDown = this._canFireAction = YES;
    this.displayDidChange();
    return YES ;
  },

  /** @private
    Remove the active class on mouseOut if mouse is down.
  */  
  mouseExited: function(evt) {
    //console.log('SimpleButton#mouseExited()...');
    if (this.get('hasHover')) {
      this._hover = NO;
    }
    if (this._isMouseDown) {
      this._isMouseDown = NO;
      this._canFireAction = NO;
    }
    this.displayDidChange();
    return YES;
  },

  /** @private
    If mouse was down and we renter the button area, set the active state again.
  */  
  mouseEntered: function(evt) {
    //console.log('SimpleButton#mouseEntered()...');
    if ( this.get('hasHover') ){
      this._hover = YES; 
    }
    if ( this._isContinuedMouseDown ) { 
      this._isMouseDown = YES;
      this._canFireAction = YES;
    }
    this.displayDidChange();
    return YES;
  },

  /** @private
    ON mouse up, trigger the action only if we are enabled and the mouse was released inside of the view.
  */  
  mouseUp: function(evt) {
    this._isMouseDown = this._isContinuedMouseDown = false;
    if (!this.get('isEnabledInPane')) return YES;
    //console.log('SimpleButton#mouseUp()...');
    // Trigger the action
    var target = this.get('target') || null;
    var action = this.get('action');    
    // Support inline functions
    if (this._canFireAction) {
      if (this._hasLegacyActionHandler()) {
        // old school... 
        this._triggerLegacyActionHandler(evt);
      } else {
        // newer action method + optional target syntax...
        this.getPath('pane.rootResponder').sendAction(action, target, this, this.get('pane'));
      }
    }
    if (this.get('hasState')) {
      this.set('inState', !this.get('inState'));
    }
    this._canFireAction = false;
    this.displayDidChange(); 
    return YES;
  },
  
  // ..........................................................
  // touch support
  // 
  touchStart: function(evt){
    return this.mouseDown(evt);
  },
  
  touchEnd: function(evt){
    return this.mouseUp(evt);
  },
  
  touchEntered: function(evt){
    return this.mouseEntered(evt);
  },

  touchExited: function(evt){
    return this.mouseExited(evt);
  },
  
  renderMixin: function(context, firstTime) {
    if (this.get('hasHover')) { 
      var hoverClass = this.get('hoverClass');
      context.setClass(hoverClass, this._hover && !this._isMouseDown); // addClass if YES, removeClass if NO
    }
    
    if (this.get('hasState')) {
      var stateClass = this.get('stateClass');
      context.setClass(stateClass, this.inState); // addClass if YES, removeClass if NO
    }
    
    var activeClass = this.get('activeClass');
    context.setClass(activeClass, this._isMouseDown);
    
    // If there is a toolTip set, grab it and localize if necessary.
    var toolTip = this.get('toolTip') ;
    
    // if SCUI.SimpleButton.alwaysEnableToolTip is YES and toolTip is null
    // get and use title if available.
    if(this.get('alwaysEnableToolTip') && !toolTip) {
      toolTip = this.get('title');
    }
    if (SC.typeOf(toolTip) === SC.T_STRING) {
      if (this.get('localize')) toolTip = toolTip.loc();
      context.attr('title', toolTip);
      context.attr('alt', toolTip);
    }
  },  
  
  /**
    @private
    From ButtonView 
    Support inline function definitions
   */
  _hasLegacyActionHandler: function(){
    var action = this.get('action');
    if (action && (SC.typeOf(action) === SC.T_FUNCTION)) return true;
    if (action && (SC.typeOf(action) === SC.T_STRING) && (action.indexOf('.') !== -1)) return true;
    return false;
  },

  /** @private */
  _triggerLegacyActionHandler: function(evt){
    var target = this.get('target');
    var action = this.get('action');

    // TODO: [MB/EG] Review: MH added the else if so that the action executes
    // in the scope of the target, if it is specified.
    if (target === undefined && SC.typeOf(action) === SC.T_FUNCTION) {
      this.action(evt);
    }
    else if (target !== undefined && SC.typeOf(action) === SC.T_FUNCTION) {
      action.apply(target, [evt]);
    }
    
    if (SC.typeOf(action) === SC.T_STRING) {
      eval("this.action = function(e) { return "+ action +"(this, e); };");
      this.action(evt);
    }
  }
  
};

