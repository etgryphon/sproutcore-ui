// ==========================================================================
// SCUI.SimpleTextFieldView
// ==========================================================================

sc_require('core');

/** @class

  A basic view wrapping a text input field since Sproutcore's is a little
  unpredicatable right now.
  
  The 'value' property contains the text in the field.

  ** Known Issue **
  Both this view and SC.TextFieldView receive two keyDown events for each
  key press.  I don't know why this is, but so far it's not too harmful.

  @extends SC.View, SC.Editable, SC.Control
  @author Jonathan Lewis
  @version 0.1
  @since 0.1
*/

SCUI.SimpleTextFieldView = SC.View.extend( SC.Editable, SC.Control, {

  // PUBLIC PROPERTIES

  classNames: ['sc-text-field-view'],
  
  isEditable: function() {
    return this.get('isEnabled');
  }.property('isEnabled').cacheable(),

  acceptsFirstResponder: function() {
    return this.get('isEnabled');
  }.property('isEnabled').cacheable(),
  
  /**
    Setter/getter for the text in the text field.
    This property is automatically notified when someone types in the field.
  */
  value: function(key, value) {
    if (value) {
      this._setFieldValue(value);
      return value;
    }
    else {
      return this._getFieldValue();
    }
  }.property().cacheable(),
  
  // PUBLIC METHODS
  
  /**
    Attaches event handlers to the input field's focus, blur, and change events.
  */
  didCreateLayer: function() {
    //console.log('%@.didCreateLayer()'.fmt(this));
    var input = this.$('input');
    SC.Event.add(input, 'change', this, this._textField_fieldValueDidChange);
    SC.Event.add(input, 'focus', this, this._textField_fieldDidFocus);
    SC.Event.add(input, 'blur',  this, this._textField_fieldDidBlur);
  },

  /**
    Cleans up the custom event handlers.
  */
  willDestroyLayer: function() {
    //console.log('%@.willDestroyLayer()'.fmt(this));
    var input = this.$('input');
    SC.Event.remove(input, 'change', this, this._textField_fieldValueDidChange);
    SC.Event.remove(input, 'focus', this, this._textField_fieldDidFocus);
    SC.Event.remove(input, 'blur',  this, this._textField_fieldDidBlur);
  },
  
  /**
    Push an input field onto the DOM.
  */
  render: function(context, firstTime) {
    sc_super();
    //var value = this.get('value') || '';
    var name = SC.guidFor(this);
    if (firstTime) {
      context.push('<input type="text" name="%@"></input>'.fmt(name));
    }
  },
  
  mouseDown: function(evt) {
    //console.log('%@.mouseDown()'.fmt(this));
    evt.allowDefault();
    return YES;
  },
  
  mouseUp: function(evt) {
    //console.log('%@.mouseUp()'.fmt(this));
    evt.allowDefault();
    return YES;
  },
  
  fieldDidFocus: function(evt) {
    if (!this._isFocused) {
      this._isFocused = YES ;
      this._applyFirefoxCursorFix();
      this.beginEditing();
    }
  },
  
  fieldDidBlur: function(evt) {
    if (this._isFocused) {
      this._isFocused = NO ;
      this._removeFirefoxCursorFix();
      this.commitEditing();
    }
  },
  
  /**
    Called whenever the text in the text field changes.
    Forces notification that 'value' property has changed to start off the kvo/kvc process.
  */
  fieldValueDidChange: function(evt) {
    this.notifyPropertyChange('value', this._getFieldValue());
  },
  
  keyDown: function(evt) {
    //console.log('%@.keyDown()'.fmt(this));
    evt.allowDefault(); // allow key event to pass through to text field
    return YES;
  },
  
  keyUp: function(evt) {
    //console.log('%@.keyUp()'.fmt(this));
    this.invokeOnce(this.fieldValueDidChange);
    evt.allowDefault();
    return YES;
  },
  
  // PRIVATE METHODS
  
  /** @private
    Custom event handler for input field's 'focus' event.
  */
  _textField_fieldDidFocus: function(evt) {
    SC.RunLoop.begin();
    this.fieldDidFocus(evt);
    SC.RunLoop.end();
  },

  /** @private
    Custom event handler for input field's 'blur' event.
  */
  _textField_fieldDidBlur: function(evt) {
    SC.RunLoop.begin();
    this.fieldDidBlur(evt);
    SC.RunLoop.end();
  },

  /** @private
    Custom event handler for input field's 'change' event.
  */
  _textField_fieldValueDidChange: function(evt) {
    SC.RunLoop.begin();
    this.fieldValueDidChange(evt);
    SC.RunLoop.end();  
  },
  
  /** @private
    Accessor function for text in the input field.
  */
  _getFieldValue: function() {
    return this.$('input').val();
  },

  /** @private
    Sets text in the input field.
  */
  _setFieldValue: function(newValue) {
    if (SC.none(newValue)) {
      newValue = '';
    }
    this.$('input').val(newValue);
  },
  
  /**
    This lets you click to position the cursor and select text in Firefox.
  */
  _applyFirefoxCursorFix: function() {
    if (SC.browser.mozilla) {
      var layer = this.get('layer');
      var p = SC.viewportOffset(this.get('layer')) ;
      var top    = p.y, 
          left   = p.x, 
          width  = layer.offsetWidth, 
          height = layer.offsetHeight ;
          
      top -= 2; 
      left -= 2;  
      
      var style = 'position: fixed; top: %@px; left: %@px; width: %@px; height: %@px;'.fmt(top, left, width, height) ;
      this.$('input').attr('style', style) ;
    }
  },

  _removeFirefoxCursorFix: function() {
    if (SC.browser.mozilla) {
      this.$('input').attr('style', '') ;
    }
  },
  
  // PRIVATE PROPERTIES
  
  _isFocused: NO
  
});
