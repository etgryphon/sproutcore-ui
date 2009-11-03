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

SCUI.SimpleTextFieldView = SC.View.extend( SC.StaticLayout, SC.Editable, {

  // PUBLIC PROPERTIES

  tagName: 'label',
  classNames: ['scui-simple-text-field-view'],
  
  isEditable: function() {
    return this.get('isEnabledInPane');
  }.property('isEnabledInPane').cacheable(),

  acceptsFirstResponder: function() {
    return this.get('isEnabledInPane');
  }.property('isEnabledInPane').cacheable(),

  /**
    The string in the text field
  */
  value: null,
  
  /**
    Set this to an object that implements keyDown() and keyUp() and that object
    will be offered the first chance to respond to a key event coming from the
    text field.  Return YES to absorb it and this text field will not use the event.
  */
  keyDelegate: null,

  /**
    Set this to an object that implements SC.Editable and calls to beginEditing() and
    commitEditing() will be delegated to that object when the text field gets and loses
    focus respectively.  If null, this text field view will call those methods on itself.
  */
  editableDelegate: null,
  
  displayProperties: ['isEnabledInPane', 'isEditing', 'value', 'isEnabled'],
  
  // PUBLIC METHODS

  /**
    Attaches event handlers to the input field's focus, blur, and change events.
  */
  didCreateLayer: function() {
    //console.log('%@.didCreateLayer()'.fmt(this));
    sc_super();
    var input = this.$input();
    SC.Event.add(input, 'change', this, this._textField_fieldValueDidChange);
    SC.Event.add(input, 'focus', this, this._textField_fieldDidFocus);
    SC.Event.add(input, 'blur',  this, this._textField_fieldDidBlur);
  },

  /**
    Cleans up the custom event handlers.
  */
  willDestroyLayer: function() {
    //console.log('%@.willDestroyLayer()'.fmt(this));
    var input = this.$input();
    SC.Event.remove(input, 'change', this, this._textField_fieldValueDidChange);
    SC.Event.remove(input, 'focus', this, this._textField_fieldDidFocus);
    SC.Event.remove(input, 'blur',  this, this._textField_fieldDidBlur);
    sc_super();
  },
  
  /**
    Push an input field onto the DOM.
  */
  render: function(context, firstTime) {
    var value = this.get('value') || '';
    var disabled, style = null, element, layer, p;

    sc_super();

    //console.log('%@.render()'.fmt(this));

    style = 'position: absolute; top: 0px; bottom: 0px; left: 0px; right: 0px;';

    if (firstTime) {
      disabled = this.get('isEnabledInPane') ? '' : 'disabled="disabled"';
      context.push('<input type="text" name="%@" %@ value="%@" style="%@"></input>'.fmt(SC.guidFor(this), disabled, value, style));
    }
    else {
      element = this.$input();
      layer = element.get(0);

      if (this.get('isEnabledInPane')) {
        layer.disabled = null;
      }
      else {
        layer.disabled = 'true';
      }

      if (SC.browser.mozilla) {
        if (this._isFocused) {
          p = SC.$(layer).offset();
          style = 'position: fixed; top: %@px; left: %@px; width: %@px; height: %@px;'.fmt(p.top, p.left, layer.parentNode.clientWidth, layer.parentNode.clientHeight);
          //console.log('Firefox fix: ' + style);
        }
        else {
          style += ' width: %@px;'.fmt(layer.parentNode.clientWidth);
        }
      }

      element.attr('style', style);
    }
  },

  parentViewDidResize: function() {
    sc_super();
    if (SC.browser.mozilla) {
      //console.log('%@.parentDidResize()'.fmt(this));
      this.displayDidChange();
    }
  },

  focus: function() {
    this.$input().get(0).focus();
  },

  blur: function() {
    this.$input().get(0).blur();
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
    var del;
    
    //console.log('%@.fieldDidFocus()'.fmt(this));
    if (!this._isFocused) {
      this._isFocused = YES ;

      del = this.get('editableDelegate') || this;
      if (del && del.beginEditing) {
        del.beginEditing();
      }
    }
  },
  
  fieldDidBlur: function(evt) {
    var del;

    //console.log('%@.fieldDidBlur()'.fmt(this));
    if (this._isFocused) {
      this._isFocused = NO ;

      del = this.get('editableDelegate') || this;
      if (del && del.commitEditing) {
        del.commitEditing();
      }
    }
  },
  
  /**
    Called whenever the text in the text field changes.
    Forces notification that 'value' property has changed to start off the kvo/kvc process.
  */
  fieldValueDidChange: function(evt) {
    //console.log('%@.fieldValueDidChange(%@)'.fmt(this, this._getFieldValue()));
    this.setIfChanged('value', this._getFieldValue());
  },
  
  keyDown: function(evt) {
    var del = this.get('keyDelegate');

    // let the key delegate take the event if it wants it (it returns YES if it takes it)
    if (del && del.keyDown && del.keyDown(evt)) {
      evt.stop();
    }
    else { // else if we're handling the key events ourselves

      // ignore the return and escape keys
      if ((evt.which === 13) || (evt.which === 27)) {
        return NO ;
      }

      //console.log('%@.keyDown()'.fmt(this));

      this._isKeyDown = YES; // enter the key pressed state
      evt.allowDefault();
    }

    return YES;
  },
  
  keyUp: function(evt) {
    var del = this.get('keyDelegate');

    if (del && del.keyUp && del.keyUp(evt)) {
      evt.stop();
    }
    else {
      if (this._isKeyDown) { // only handle key up after there has been a key down
        //console.log('%@.keyUp()'.fmt(this));
        this.invokeOnce(this.fieldValueDidChange);
      }
      evt.allowDefault();
    }

    this._isKeyDown = NO; // exit the key pressed state
    return YES;
  },
  
  /**
    Helper function
  */
  $input: function() {
    //return this.$('input');
    return this.$('input').andSelf().filter('input');
  },
  
  willBecomeKeyResponderFrom: function(view) {
    //console.log('%@.willBecomeKeyResponderFrom()'.fmt(this));
    if (!this._isFocused) {
      if (this.get('isVisibleInWindow')) {
        this.$input().get(0).focus();
      }
    }
  },

  didLoseKeyResponderTo: function(view) {
    //console.log('%@.didLoseKeyResponderTo()'.fmt(this));
    if (this._isFocused) {
      this.$input().get(0).blur();
    }
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
    return this.$input().val();
  },

  /** @private
    Sets text in the input field.
  */
  _setFieldValue: function(newValue) {
    if (SC.none(newValue)) {
      newValue = '';
    }
    this.$input().val(newValue);
  },

  _stfv_valueDidChange: function() {
    //console.log('%@._stfv_valueDidChange(%@)'.fmt(this, this.get('value')));
    var currentText = this._getFieldValue();
    var value = this.get('value');
    if (value !== currentText) {
      this._setFieldValue(value);
    }
  }.observes('value'),
    
  // PRIVATE PROPERTIES
  
  _isKeyDown: NO,
  _isFocused: NO
  
});
