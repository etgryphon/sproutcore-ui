// ==========================================================================
// SCUI.TextFieldView
// ==========================================================================
 
sc_require('core');
 
/** @class
 
  This view provides a robust set of funtionality beyond what is available in the
  SCUI.SimpleTextFieldView. The view includes the following:
  
   - can set left and right accessory views
   - can set a hint that will display when the text field is empty
   - can set the actual text field's layout such as when you want to provide padding
   - provides additional DIVs to set the background of this view to give extra styling.
   
  In order to acquire the value of the text field you simply use this view's value
  property. In addition, you can still use the key delegate and editable delegate that
  the SCUI.SimpleTextFieldView makes use of.
  
  Regarding the left and right accessory views, they can be changed dynamically. When
  the views change this view will update accordingly.
  
  @extends SC.View
  @author Michael Cohen
  @version 0.1
  @since 0.1
 
*/
 
SCUI.TextFieldView = SC.View.extend({
  
  DEFAULT_ACCESSORY_VIEW_WIDTH: 25,
  
  classNames: ['scui-text-field-view'],
  
  /**
    Sets the width of the left accessory view
  
    @see #leftAccessoryView
    @property {Integer}
  */
  leftAccessoryWidth: 25,
  
  /**
    Sets the width of the right accessory view
    
    @see #rightAccessoryView
    @property {Integer}
  */
  rightAccessoryWidth: 25,
  
  /**
    Sets a left accessory view for this view. The text field will
    be automatically left adjusted to the accessory if set. If property
    is null then no left accessory will be displayed.
  
    @see #leftAccessoryWidth
    @property {SC.View|String}
  */
  leftAccessoryView: null,
  
  /**
    Sets a right accessory view for this view. The text field will
    be automatically right adjusted to the accessory if set. If property
    is null then no right accessory will be displayed.
  
    @see #rightAccessoryWidth
    @property {SC.View|String}
  */
  rightAccessoryView: null,
  
  /**
    The value of this view's text field
  */
  value: null,
  
  /**
    An optional hint to display if the text field is empty. If no hint is
    provided then the text field will be displayed no matter what value it has.
  */
  hint: null,
  
  /**
    The key delegate that this view's text field makes use of
    
    @see SCUI.SimpleTextFieldView#keyDelegate
  */
  keyDelegate: null,
  
  /**
    The editable delegate that this view's text field makes use of
    
    @see SCUI.SimpleTextFieldView#editableDelegate
  */
  editableDelegate: null,
  
  /**
    The layout for this view's text field. Use this if you want to provide
    some padding. If not set then the text field will be flush with the top,
    bottom, left and right boundaries of the parent view and the accessory views,
    if set.
    
    @see #leftAccessoryView
    @see #rightAccessoryView
  */
  textFieldLayout: { top: 0, bottom: 0, right: 0, left: 0 },
  
  createChildViews: function() {
    var childViews = [], view;
    
    // Background view. This needs to be a seperate child view so that the re-rendering does
    // not causes the other child views to behave incorrectly.
    this._background = this.createChildView(SC.View.design({
      focus: NO,
      displayProperties: 'focus'.w(),
      render: function(context, firstTime) {
        context = context.begin().addClass('left-edge').setClass('focus', this.get('focus')).end();
        context = context.begin().addClass('inner').setClass('focus', this.get('focus')).end();
        context = context.begin().addClass('right-edge').setClass('focus', this.get('focus')).end();
      }
    }));
    childViews.push(this._background);
    
    this._leftAccessoryRegion = this.createChildView(SC.View.design({
      classNames: 'left-accessory-region'.w(),
      isVisible: NO
    }));
    childViews.push(this._leftAccessoryRegion);
  
    this._rightAccessoryRegion = this.createChildView(SC.View.design({
      classNames: 'right-accessory-region'.w(),
      isVisible: NO
    }));
    childViews.push(this._rightAccessoryRegion);
  
    this._textFieldRegion = this.createChildView(SC.View.design({
      owner: this,
      classNames: 'text-field-region'.w(),
      childViews: 'textField'.w(),
      textField: SCUI.SimpleTextFieldView.design({
        layout: this.get('textFieldLayout'),
        valueBinding: SC.binding('value', this),
        keyDelegate: this.get('keyDelegate'),
        editableDelegate: this.get('editableDelegate'),
        fieldDidBlur: function(evt) {
          sc_super();
          var owner = this.get('parentView').get('parentView');
          owner._activateHint();
          owner._background.set('focus', NO);
        },
        fieldDidFocus: function(evt) {
          sc_super();
          var owner = this.get('parentView').get('parentView');
          owner._background.set('focus', YES);
        }
      })
    }));
    this._textField = this._textFieldRegion.get('textField');
    childViews.push(this._textFieldRegion);
    
    this.set('childViews', childViews);
    
    this._accessoryViewDidChange();
    this._activateHint();
  },
  
  /** @private
    Actives the hint. The hint will only display if a hint was actually provided and the text field's value
    is not empty 
  */
  _activateHint: function() {
    if (this.get('hint') && !this._hintActivated && (!this.get('value') || this.get('value').length === 0)) {
      this._hintActivated = YES;
       // We need to explicitly remove the text field so that when it gets added back it will render
       // properly. Simply toggling the isVisible property won't work as the text field renders weirdly
       // in Firefox.
      this._textFieldRegion.removeChild(this._textField);
      this._showHint(YES);
    }
  },
  
  /** @private
    Deactivates the hint if it is currently visible.
  */
  _deactivateHint: function() {
    if (!this.get('hint') || !this._hintActivated) return;
    this._hintActivated = NO;
    this._showHint(NO);
    this._textFieldRegion.appendChild(this._textField);
    this._updateTextFieldLayout();
  },
  
  /** @private
    What actually toggles the visiblity of the hint in this view.
  */
  _showHint: function(show) {
    if (show) {
      if (!this._hintView) {
        this._hintView = SC.View.design({
          layout: this.get('textFieldLayout'),
          classNames: 'hint'.w(),
          childViews: 'label'.w(),
          label: SC.LabelView.design({
            value: this.get('hint')
          }),
          mouseDown: function(evt) {
            var owner = this.get('parentView').get('parentView');
            owner._deactivateHint();
            return NO;
          }
        });
        this._hintView = this._hintView.create();
        this._textFieldRegion.appendChild(this._hintView);
      }
      this._hintView.set('isVisible', YES);
    } else {
      if (!this._hintView) return;
      this._hintView.set('isVisible', NO);
    }
  },
  
  /** @private
    Will create the left and right accessory views if set
  */
  _createAccessoryView: function(value) {
    var view = this.get('%@AccessoryView'.fmt(value));
    if (!view) return null;
    if (view.isObject) return view;
    if (view.isClass) {
      view = view.create();
      return view;
    }
    if (SC.typeOf(value) === SC.T_STRING && value.length > 0) {
      if (value.indexOf('.') > 0) {
        return SC.objectForPropertyPath(value, null);
      } else {
        return SC.objectForPropertyPath(value, this.get('page'));
      }
    }
    return null;
  },
  
  /** @private
    Observes changes to the left and right accessory view properties. If they
    change then update this view's children.
  */
  _accessoryViewDidChange: function() {
    var leftAccessoryView = this._createAccessoryView('left');
    if (leftAccessoryView) {
      this._leftAccessoryRegion.removeAllChildren();
      this._leftAccessoryRegion.appendChild(leftAccessoryView);
      this._leftAccessoryRegion.set('isVisible', YES);
    } else {
      this._leftAccessoryRegion.set('isVisible', NO);
    }
    
    var rightAccessoryView = this._createAccessoryView('right');
    if (rightAccessoryView) {
      this._rightAccessoryRegion.removeAllChildren();
      this._rightAccessoryRegion.appendChild(rightAccessoryView);
      this._rightAccessoryRegion.set('isVisible', YES);
    } else {
      this._rightAccessoryRegion.set('isVisible', NO);
    }
  
    this._accessoryWidthDidChange();
  }.observes('leftAccessoryView', 'rightAccessoryView'),
  
  /** @private
    Observes changes to the left and right accessory width properties. If they
    change then update this view's children.
  */
  _accessoryWidthDidChange: function() {
    var leftAccessoryWidth = this.get('leftAccessoryWidth');
    if (!leftAccessoryWidth) leftAccessoryWidth = this.DEFAULT_ACCESSORY_VIEW_WIDTH;
    
    var rightAccessoryWidth = this.get('rightAccessoryWidth');
    if (!rightAccessoryWidth) rightAccessoryWidth = this.DEFAULT_ACCESSORY_VIEW_WIDTH;
    
    var accessoryLayout;
    
    if (this._leftAccessoryRegion.get('isVisible')) {
      accessoryLayout = { left: 0, top: 0, bottom: 0, width: leftAccessoryWidth };
      this._leftAccessoryRegion.set('layout', accessoryLayout);
    }
    
    if (this._rightAccessoryRegion.get('isVisible')) {
      accessoryLayout = { right: 0, top: 0, bottom: 0, width: rightAccessoryWidth };
      this._rightAccessoryRegion.set('layout', accessoryLayout);
    }
    
    this._updateTextFieldLayout();
  }.observes('leftAccessoryWidth', 'rightAccessoryWidth'),
  
  /** @private
    updates the layout of this view's text field.
  */
  _updateTextFieldLayout: function() {
    var leftAccessoryWidth = 0;
    if (this._leftAccessoryRegion.get('isVisible')) {
       leftAccessoryWidth = this.get('leftAccessoryWidth');
       if (!leftAccessoryWidth) leftAccessoryWidth = this.DEFAULT_ACCESSORY_VIEW_WIDTH;
    }
    
    var rightAccessoryWidth = 0;
    if (this._rightAccessoryRegion.get('isVisible')) {
      rightAccessoryWidth = this.get('rightAccessoryWidth');
      if (!rightAccessoryWidth) rightAccessoryWidth = this.DEFAULT_ACCESSORY_VIEW_WIDTH;
    }
    
    var textFieldLayout = { left: leftAccessoryWidth, top: 0, bottom: 0, right: rightAccessoryWidth };
    this._textFieldRegion.set('layout', textFieldLayout);
  }
  
});