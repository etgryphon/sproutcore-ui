// ==========================================================================
// SCUI.DropDown
// ==========================================================================

/*globals SCUI*/

/** @mixin
  This mixin allows a toggling view to show/hide a drop-down when the view
  is toggled.  The user should set the 'dropDown' property to a SC.PickerPane or descendant
  class.  When the view is toggled on, an instance of the dropDown will be
  created and shown.
  
  NOTE: This mixin must be used in conjunction with the SCUI.SimpleButton mixin or
        on a SC.ButtonView or descendant.  It needs the target and action properties to work.

  @author Jonathan Lewis
  @author Brandon Blatnick

*/

SCUI.DropDown = {  
  
  isShowingDropDown: NO,
  
  /**
    params
  */
  target: null,
  action: null,
  closeTarget: null,
  closeAction: null,
  
  /**
    @private
    Reference to the drop down instance that gets created in init().
  */
  _dropDownPane: null,
  
  dropDown: SC.MenuPane.design({ /* an example menu */
    layout: { width: 100, height: 0 },
    contentView: SC.View.design({}),
    items: ["_item".loc('1'), "_item".loc('2')] // Changed to an array for Localization purposes.
  }),
  
  dropDownType: SC.PICKER_MENU,
  
  initMixin: function() {
    var target, action, cTarget, cAction, dropDown;
    // Try to create a new menu instance
    dropDown = this.get('dropDown');
    if (dropDown && SC.typeOf(dropDown) === SC.T_CLASS) {
      this._dropDownPane = dropDown.create();
      this.set('dropDown', this._dropDownPane); // set as pointer to instance for convenience
      if (this._dropDownPane) {
        this.bind('isShowingDropDown', '._dropDownPane.isPaneAttached');
      }
    }

    // Set up the action that gets called on the trigger event
    target = this.target || this;
    action = this.action || 'toggle';
    this.set('target', target);
    this.set('action', action);
    
    // Set up an observer if picker is closed and you want an external event
    if (!SC.none(this.closeAction)){
      this.addObserver('isShowingDropDown', this, this._isShowingDropDownChanged); 
    }
  },
  
  /**  
    Hides the attached drop down if present.  This is called automatically when
    the button gets toggled off.
  */
  hideDropDown: function() {
    if (this._dropDownPane && SC.typeOf(this._dropDownPane.remove) === SC.T_FUNCTION) {
      this._dropDownPane.remove();
      this.set('isShowingDropDown', NO);
    }
  },

  /**
    Shows the menu.  This is called automatically when the button is toggled on.
  */
  showDropDown: function() {
    // If a menu already exists, get rid of it
    this.hideDropDown();

    // Now show the menu
    if (this._dropDownPane && SC.typeOf(this._dropDownPane.popup) === SC.T_FUNCTION) {
      var dropDownType = this.get('dropDownType'),
          view = this.get('layer') || this,
          anchor = this.get('anchor') || this;
      if(SC.typeOf(anchor) === SC.T_STRING) {
        anchor = view.$(anchor).firstObject();
        this.set('anchor', anchor); // cache the DOM reference, as this shouldn't change
      }
      this._dropDownPane.popup(anchor, dropDownType); // show the drop down
      this.set('isShowingDropDown', YES);
    }
  },
  
  /**
    Toggles the menu on/off accordingly
  */
  toggle: function() {
    if (this.get('isShowingDropDown')){
      this.hideDropDown();
    }
    else {
      this.showDropDown();
    }
  },
  
  /**
    this only gets called if there are special external close actions
  */
  _isShowingDropDownChanged: function(){
    var t, a, st = this.get('isShowingDropDown');
    if (st === NO){
      t = this.get('closeTarget') || this.get('target') || this;
      a = this.get('closeAction');
      this.getPath('pane.rootResponder').sendAction(a, t, this, this.get('pane'));
    } 
  }
};

