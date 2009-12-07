// ==========================================================================
// SCUI.ComboBoxView
// ==========================================================================

sc_require('mixins/simple_button');

/** @class

  This view creates a combo-box text field view with a dropdown list view
  for type ahead suggestions; useful as a search field.

  @extends SC.View, SC.Editable
  @author Jonathan Lewis
*/

SCUI.ComboBoxView = SC.View.extend( SC.Editable, {

  // PUBLIC PROPERTIES

  classNames: ['scui-combobox-view'],

  isEditable: YES,
  
  /**
    The width of the drop-down button which is right-justified
    next to the text field.
  */
  dropDownButtonWidth: 24,

  /**
    Override this if you want to set your own CSS classes on the
    drop-down button.  Should be an array of class names.
  */
  dropDownButtonClassNames: ['scui-combobox-dropdown-button-view'],
  
  /**
    An array of available items; may be strings.  These values show
    up in the drop-down pane when you start typing in the text field.
  */
  content: null,
  contentValueKey: null,
  contentHasIcon: NO,
  contentIconKey: null,

  /**
    The currently selected item.
  */
  selectedItem: null,

  /**
    The string value showing in the text field
  */
  textFieldValue: null,
  
  /**
    Set to YES if you'd like to do your own searching and content autosuggesting.
    In that case, use 'filter' as your query string, and update the 'content' array
    property when you have new results to show in the drop-down box.
  */
  useExternalFilter: NO,

  /**
    The filter string, based on what is typed in the text field.  Might be different from 'textFieldValue'
    as it is only updated by typing in the text field, not by autocomplete text inserts.
  */
  filter: null,

  displayProperties: ['isEnabled', 'isEnabledInPane'],

  // PUBLIC METHODS
  
  didCreateLayer: function() {
    sc_super();
    this._createListPane();
  },
  
  createChildViews: function() {
    var childViews = [];
    var dropDownButtonWidth = this.get('dropDownButtonWidth') || 24;

    // Create the text field view
    this._textFieldView = this.createChildView(
      SC.TextFieldView.design({
        classNames: ['scui-combobox-text-field-view'],
        layout: { left: 0, top: 0, bottom: 0, right: dropDownButtonWidth },
        valueBinding: SC.Binding.from('.textFieldValue', this),
        keyDelegate: this, // the text field will offer key events to this combobox view first
        editableDelegate: this, // the text field will tell us when to start / stop editing (i.e. when it gets or loses focus)
        isEnabledBinding: SC.Binding.from('.isEnabledInPane', this).oneWay(),

        keyDown: function(evt) {
          var del = this.get('keyDelegate');
          // let the key delegate take the event if it wants it (it returns YES if it takes it)
          if (del && del.keyDown && del.keyDown(evt)) {
            evt.stop();
            return YES;
          }
          return sc_super();
        },

        keyUp: function(evt) {
          var del = this.get('keyDelegate');
          if (del && del.keyUp && del.keyUp(evt)) {
            evt.stop();
            return YES;
          }
          return sc_super();
        },
        
        fieldDidFocus: function(evt) {
          this._isFocused = NO;
          return sc_super();
        },

        beginEditing: function() {
          var del = this.get('editableDelegate');
          var ret = sc_super();
          if (ret && del && del.beginEditing) {
            del.beginEditing();
          }
          return ret;
        },
        
        commitEditing: function() {
          var del = this.get('editableDelegate');
          var ret = sc_super();
          if (ret && del && del.commitEditing) {
            del.commitEditing();
          }
          return ret;
        }
      })
    );
    childViews.push(this._textFieldView);

    // Add a button to show/hide the drop-down list
    this._dropDownButtonView = this.createChildView(
      SC.View.design( SCUI.SimpleButton, {
        classNames: this.get('dropDownButtonClassNames') || [],
        layout: { right: 0, top: 0,  width: dropDownButtonWidth, bottom: 0 },
        target: this,
        action: 'toggleList',
      })
    );
    childViews.push(this._dropDownButtonView);
    
    this.set('childViews', childViews);
  },

  /**
    Implements SC.Editable.
    Gives the text field focus.  Called automatically when you click in the text field itself or on the drop-down button.
  */
  beginEditing: function() {
    if (!this.get('isEditable')) {
      return NO;
    }
    
    if (this.get('isEditing')) {
      return YES;
    }
      
    this.set('isEditing', YES);
      
    this._keyPressed = NO;
    this._proposedItem = null;
      
    this.set('filter', null);
    
    if (!this._textFieldView.get('isEditing')) {
      this._textFieldView.beginEditing(); // this will cause the text field to take first responder, which we want it to have
    }
    
    return YES;
  },
  
  /**
    Implements SC.Editable.
    Determines which item should be selected from the text in the text field.  It attempts to search
    'content' for possible matches and if nothing is found, snaps back to the currently selected item if present.
    Called automatically when the text field loses focus, or you can call it any time yourself, at which
    point it will blur the text field for you.
  */
  commitEditing: function() {
    if (this.get('isEditing')) {
      this._keyPressed = NO;
    
      if (!this.get('textFieldValue')) {
        this.setIfChanged('selectedItem', null);
      }
      
      this._setItemAsTextFieldValue(this.get('selectedItem'));
      this.set('isEditing', NO);
    
      this.hideList(); // make sure this gets closed
    }
    
    this._proposedItem = null;

    if (this._textFieldView.get('isEditing')) {
      this._textFieldView.commitEditing(); // allow the text field itself to resign first responder
    }
    
    return YES;
  },
  
  toggleList: function() {
    //console.log('%@.toggleList()'.fmt(this));
    if (this._listPane && this._listPane.get('isPaneAttached')) {
      this.hideList();
    }
    else {
      this.showList();
    }
  },

  /**
    Returns YES if it did indeed show the list, otherwise NO.
  */
  showList: function() {
    //console.log('%@.showList()'.fmt(this));
    if (this._listPane && !this._listPane.get('isPaneAttached')) {
      this._textFieldView.beginEditing();
      this._listPane.popup(this, SC.PICKER_MENU);
      this._listPane.get('contentView').scrollTo(0, 0);
      return YES;
    }
    return NO;
  },

  /**
    Returns YES if it did indeed hide the list, otherwise NO.
  */
  hideList: function() {
    //console.log('%@.hideList()'.fmt(this));
    if (this._listPane && this._listPane.get('isPaneAttached')) {
      this._listPane.remove();
      return YES;
    }
    return NO;
  },
  
  keyDown: function(evt) {
    //console.log('%@.keyDown()'.fmt(this));
    return this.interpretKeyEvents(evt);
  },

  /**
    Called by SC.View.interpretKeyEvents().
    We pass up/down arrow keys on to the list view.
  */
  moveUp: function(evt) {
    this._keyPressed = NO;
    if (this._listPane) {
      if (this._listPane.get('isPaneAttached')) {
        this._listView.moveUp(evt);
      }
      else {
        this.showList();
      }
    }
    return YES;
  },

  moveDown: function(evt) {
    this._keyPressed = NO;
    if (this._listPane) {
      if (this._listPane.get('isPaneAttached')) {
        this._listView.moveDown(evt);
      }
      else {
        this.showList();
      }
    }
    return YES;
  },

  insertNewline: function(evt) {
    this._keyPressed = NO;
    if (this._proposedItem) {
      this.set('selectedItem', this._proposedItem);
    }
    return this.hideList(); // absorb it if we used [Enter] to select and item and close the list.
  },

  insertText: function(evt) {
    this._keyPressed = YES; // a change occurred via a key press
    return NO; // don't handle it so the event will just pass through
  },

  /**
    Pressing the escape key simply closes the list pane; doesn't affect
    the selected item at all.
  */
  cancel: function(evt) {
    this._keyPressed = NO;
    return this.hideList(); // absorb the escape key if we used it to close the list
  },

  deleteBackward: function(evt) {
    this._keyPressed = YES;
    return NO;
  },
  
  deleteForward: function(evt) {
    this._keyPressed = YES;
    return NO;
  },

  // PRIVATE METHODS
  
  /**
    @private
    Updates the filter text based on what is typed in the text field
  */
  _cbv_textFieldValueDidChange: function() {
    var value;
    //console.log('%@._cbv_textFieldValueDidChange(%@)'.fmt(this, this.get('textFieldValue')));
    if (this._keyPressed && this.get('isEditing')) {
      value = this.get('textFieldValue');
      this._proposedItem = null;
      this.set('filter', value);
      this.showList();
    }
    this._keyPressed = NO; // reset the flag
  }.observes('textFieldValue'),

  /**
    @private
    Takes the item selected in the drop down box and makes it the text in the text field
  */
  _cbv_listSelectionDidChange: function() {
    //console.log('%@._listSelectionDidChange(%@)'.fmt(this, this.get('_listSelection')));
    var sel = this.get('_listSelection');
    this._proposedItem = sel ? sel.firstObject() : null;
    this._setItemAsTextFieldValue(this._proposedItem);
  }.observes('_listSelection'),

  _cbv_selectedItemDidChange: function() {
    var sel = this.get('selectedItem');
    // console.log('%@._cbv_selectedItemDidChange(%@)'.fmt(this, sel));
    this._setItemAsTextFieldValue(sel);
  }.observes('selectedItem'),

  /**
    Keep the drop down list the same width as the combo box itself
  */
  _cbv_frameDidChange: function() {
    if (this._listPane) {
      var frame = this.get('frame');
      var width = frame ? frame.width : 200;
      this._listPane.adjust({ width: width });
    }
  }.observes('frame'),

  /**
    @private
    Make the text field value match 'item'
  */
  _setItemAsTextFieldValue: function(item) {
    var newValue = this._getItemValue(item, this.get('contentValueKey')) || '';
    //console.log('%@._setItemAsTextFieldValue(%@)'.fmt(this, newValue));
    this.setIfChanged('textFieldValue', newValue);
  },

  /**
    @private
    Create and cache the drop down pane
  */
  _createListPane: function() {
    var frame = this.get('frame');
    var width = frame ? frame.width : 200;
    
    this._listPane = SC.PickerPane.create({
      classNames: ['scui-combo-box-list-pane'],
      layout: { width: width, height: 150 },
      acceptsKeyPane: NO,
      acceptsFirstResponder: NO,
      target: this,
      contentView: SC.ScrollView.design({
        classNames: ['scui-combo-box-list-view'],
        layout: { left: 0, right: 0, top: 0, bottom: 0 },
        hasHorizontalScroller: NO,
        contentView: SC.ListView.design({
          layout: { left: 0, right: 0, top: 0, bottom: 0 },
          target: this,
          contentBinding: SC.Binding.from('._suggestedContent', this).oneWay(),
          contentValueKey: this.get('contentValueKey'),
          hasContentIcon: this.get('hasContentIcon'),
          contentIconKey: this.get('contentIconKey'),
          allowsMultipleSelection: NO,
          
          /**
            When someone clicks on the pane, close it.
          */
          mouseUp: function() {
            sc_super();
            this.target.invokeOnce('_selectItemAndHideList');
            return YES;
          }
        }),
        
        mouseDown: function() {
          sc_super();
          return YES;
        },
        
        mouseUp: function() {
          sc_super();
          return YES;
        }
      }),
      
      /**
        Jump into this event handler to commit editing at the same time
        we're clicking out of the list pane.  Calls sc_super() to make this
        transparent to the pane.
      */
      modalPaneDidClick: function(evt) {
        sc_super();
        //console.log('%@.modalPaneDidClick()'.fmt(this));
        this.target.invokeOnce('_selectItemAndHideList');
        return YES;
      }
      
    });
    
    // Keep a reference to the list view
    this._listView = this._listPane.getPath('contentView.contentView');

    // Bind the listview selection to a local property.
    this._listView.bind('selection', this, '_listSelection');
  },
  
  _selectItemAndHideList: function() {
    if (this._proposedItem) {
      this.set('selectedItem', this._proposedItem);
    }
    this.hideList();
  },
  
  /**
    @private
    Fetches the display string from an item
  */
  _getItemValue: function(item, contentValueKey) {
    if (item) {
      if (contentValueKey) {
        if (item.get) {
          return item.get(contentValueKey);
        }
        else {
          return item[contentValueKey];
        }
      }
      else if (SC.typeOf(item) === SC.T_STRING) {
        return item;
      }
    }
    return null;
  },
  
  _sanitizeSearchString: function(str){
    if (str) {
      var specials = [
          '/', '.', '*', '+', '?', '|',
          '(', ')', '[', ']', '{', '}', '\\'
      ];
      var s = new RegExp('(\\' + specials.join('|\\') + ')', 'g');
      return str.replace(s, '\\$1');
    }
    return str;
  },
  
  // PRIVATE PROPERTIES

  /**
    Calculates suggested content for the list pane.  Changes based on what is typed in the search box.
  */
  _suggestedContent: function() {
    var content = this.get('content') || []; // 'content' is an array of allowed items
    var filter = this._sanitizeSearchString(this.get('filter'));
    var results, length, item, value, key, rowHeight, listHeight;

    if (!this.get('useExternalFilter') && filter) {
      filter = filter.toLowerCase();
      results = [];
      key = this.get('contentValueKey');
      length = content.get('length');
      for (var i = 0; i < length; i++) {
        item = content.objectAt(i);
        value = this._getItemValue(item, key);

        if (SC.typeOf(value) === SC.T_STRING && value.toLowerCase().search(filter) >= 0) {
          results.push(item);
        }
      }
    }
    else { // using external auto-suggest generator or there is no filter, so 'content' is our suggested content; just pass it through
      results = content;
    }

    return results;
  }.property('content', 'filter').cacheable(),
  
  _textFieldView: null,
  _dropDownButtonView: null,

  _listPane: null, // the drop-down pane
  _listView: null, // the listview in the drop-down pane
  _listSelection: null, // bound to the listview in the drop-down pane
  _proposedItem: null, // the item that will become the 'selectedItem' when commitEditing() is called.
  
  _keyPressed: NO // keeps track of whether or not a text field change was caused by typing or not
  
});
