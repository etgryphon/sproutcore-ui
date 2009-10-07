// ==========================================================================
// SCUI.AutoSuggestTextView
// ==========================================================================

sc_require('core');
sc_require('views/simple_text_field');

/** @class

  This view creates a combo-box-style text field view with a dropdown list view
  for type ahead suggestions; useful as a search field.

  It is designed to be used with a controller that binds to the 'query' property
  and provides an array of suggested search results in response to query changes.

  @extends SCUI.SimpleTextFieldView
  @author Evin Grano
  @author Jonathan Lewis
  @version 0.1
  @since 0.1
*/

SCUI.AutoSuggestTextView = SCUI.SimpleTextFieldView.extend(
/** @scope SCUI.AutoSuggestTextView.prototype */ {
  
  // PUBLIC PROPERTIES
  
  classNames: ['scui-autosuggesttext-view'],

  /**
    The query string that the user types.  This is not always the same as the text
    in the text field.  When a user uses arrow keys to step through suggested
    results, we have to be able to auto-fill the text field without retriggering
    the query.  So this property only changes when the user types, not every time
    the text changes.

    Controllers interested in providing suggestions should bind to this property,
    not the 'value' property.
  */
  query: null,

  /**
    @array.
    Set this to an array of suggested items based on the query text.
  */
  suggestedContentPath: null,
  suggestedContentValueKey: null,
  suggestedContentHasIcon: NO,
  suggestedContentIconKey: 'icon',

  /**
    The item in 'content' that was selected, either by typing or by clicking on the autosuggest list.
    This will be changed whenever the 'enter' key is pressed with valid text in the field or with a
    valid selection in the suggestion list, or when focus is lost with valid text in the field.
  */
  selectedItem: null,

  // PUBLIC METHODS
  
  init: function() {
    sc_super();

    // Bind to a local copy of the suggested content
    var contentPath = this.get('suggestedContentPath');
    if (contentPath) {
      this.bind('_suggestedContent', SC.Binding.from(contentPath).oneWay());
    }
    else {
      console.info('(%@) suggestedContentPath is null. AutoSuggestTextView will be unable to auto-complete searches.'.fmt(this));
    }
  },
  
  didCreateLayer: function() {
    sc_super();
    this._createListPane(); // initialize the suggestion list pane
  },

  keyDown: function(evt) {
    if (this.interpretKeyEvents(evt)) {
      return YES;
    }
    else {
      return sc_super();
    }
  },
  
  keyUp: function(evt) {
    return sc_super();
  },

  /**
    Called by SC.View.interpretKeyEvents().
    We pass up/down arrow keys on to the list view.
  */
  moveDown: function(evt) {
    if (this._listPane && this._listPane.get('isPaneAttached')) {
      return this._listView.moveDown(evt);
    }
    return NO;
  },
  
  moveUp: function(evt) {
    if (this._listPane && this._listPane.get('isPaneAttached')) {
      return this._listView.moveUp(evt);
    }
    return NO;
  },

  insertText: function(evt) {
    this._keyDown = YES; // a change occurred via a key press
    return NO; // don't handle it so the event will just pass through
  },

  insertNewline: function(evt) {
    // try to accept the selection
    if (this._proposedItem) {
      this.set('selectedItem', this._proposedItem);
    }
    this._hideList();
    return NO;
  },

  cancel: function(evt) {
    this._hideList();
    return YES; // absorb the escape key
  },

  deleteBackward: function(evt) {
    this._keyDown = YES; // text changed via key press
    return NO;
  },
  
  deleteForward: function(evt) {
    this._keyDown = YES; // text changed via key press
    return NO;
  },

  /**
    Called when the text field gets focus.
  */
  beginEditing: function() {
    this._keyDown = NO;
    this._proposedItem = null;
    return sc_super();
  },

  discardEditing: function() {
    return sc_super();
  },

  /**
    Called when the text field loses focus.
    Take this opportunity to finalize the selected item.
  */
  commitEditing: function() {
    sc_super();

    this._keyDown = NO;

    var value = this.get('value');
    if (!this._proposedItem && value) {
      // the user typed something, so find a new match or revert to the last selected item
      this._proposedItem = this._findSuggestedItem(value) || this.get('selectedItem');
    }
    this.set('selectedItem', this._proposedItem); // finalize the selection
    this._setItemAsValue(this._proposedItem); // set the text in the field to match
    this._hideList();
    this._proposedItem = null; // cleanup

    console.log('%@.commitEditing(selected item is: %@)'.fmt(this, this.get('selectedItem')));
    return YES;
  },
  
  // PRIVATE METHODS

  /** @private
    Triggered by changes to the text in the field, but only updates
    the 'query' property if those changes were caused by someone typing in the field,
    and we are in editing mode.
  */
  _updateQuery: function() {
    if (this._keyDown && this.get('isEditing')) {
      var value = this.get('value');
      this._proposedItem = null;
      this.set('query', value);
    }
    this._keyDown = NO; // reset the flag
  }.observes('value'),

  /** @private
    Given a string, return a matching suggested item if there is one.
  */
  _findSuggestedItem: function(value) {
    var suggestedContent = this.get('_suggestedContent') || [];
    var length = suggestedContent.get('length');
    var obj;
    var key = this.get('suggestedContentValueKey');

    for (var i = 0; i < length; i++) {
      obj = suggestedContent.objectAt(i);
      if (key) {
        if (obj.get(key) === value) {
          return obj;
        }
      }
      else if (SC.typeOf(obj) === SC.T_STRING) {
        if (obj === value) {
          return obj;
        }
      }
    }
    return null;
  },

  /** @private
    Show the suggestion list if it's not already showing.
  */
  _showList: function(){
    if (this._listPane && !this._listPane.get('isPaneAttached')) {
      this._listPane.popup(this, SC.PICKER_MENU);

      // Every time we show the list, scroll to the top
      this._listPane.get('contentView').scrollTo(null, 0);
    }
  },

  /** @private
    Hide the suggestion list if it is showing.
  */
  _hideList: function(){
    if (this._listPane && this._listPane.get('isPaneAttached')) {
      this._listPane.remove();
    }
  },

  /** @private
    Called by the suggestion list pane when someone clicks on it.
    We try to set the selectedItem immediately and close the list.
  */
  _selectAndHide: function () {
    if (this._proposedItem) {
      this.set('selectedItem', this._proposedItem);
    }
    this._hideList();
  },

  /** @private
    Initializes the list pane and content view.
  */
  _createListPane: function() {
    var frame = this.get('frame');
    var width = frame ? frame.width : 200;
    var that = this;

    this._listPane = SC.PickerPane.create({
      layout: { width: width, height: 150 },
      acceptsKeyPane: NO,
      acceptsFirstResponder: NO,

      target: that,
      
      contentView: SC.ScrollView.design({
        layout: { left: 0, right: 0, top: 0, bottom: 0 },
        hasHorizontalScroller: NO,
        contentView: SC.ListView.design({
          layout: { top: 0, right: 0, bottom: 0, left: 0 },
          hasContentIcon: this.get('suggestedContentHasIcon'),
          contentValueKey: this.get('suggestedContentValueKey'),
          contentIconKey: this.get('suggestedContentIconKey'),
          target: that,

          /**
            When someone clicks on the pane, close it.
          */
          mouseUp: function(evt) {
            sc_super();
            this.target.invokeOnce('_selectAndHide');
            return YES;
          }
        })
      })
    });

    // Keep a reference to the list view
    this._listView = this._listPane.getPath('contentView.contentView');

    // Bind the listview selection to a local property.
    this._listView.bind('selection', this, '_listSelection');

    var contentPath = this.get('suggestedContentPath');
    if (contentPath) {
      this._listView.bind('content', SC.Binding.from(contentPath).oneWay());
    }
  },

  /** @private
    Called when a suggestion is selected.  Since the user might be simply
    scrolling through results using the arrow keys, don't actually change the
    'selectedItem' property, but store the selection as a possibility.
  */
  _listSelectionDidChange: function() {
    var sel = this.get('_listSelection');
    var item = null;
    if (sel) {
      item = sel.firstObject();
    }
    this._proposedItem = item; // store it
    this._setItemAsValue(item); // set its value as the field text.
  }.observes('_listSelection'),

  /** @private
    Get a value string from an item and set it as the field text.
  */
  _setItemAsValue: function(item) {
    var key, newValue = null;
    if (item) {
      key = this.get('suggestedContentValueKey');
      if (key) {
        newValue = item.get(key);
      }
      else if (SC.typeOf(item) === SC.T_STRING) {
        newValue = item;
      }
    }
    this.set('value', newValue || '');
  },
  
  /** @private
    Called when new suggestions arrive.  This controls the showing/hiding of
    the list pane.  The pane will only be shown when there are suggestions to show.
  */
  _suggestedContentDidChange: function() {
    var content = this.get('_suggestedContent');
    //console.log('%@._suggestedContentDidChange(%@)'.fmt(this, content));
    this._proposedItem = null;
    if (content && content.get('length') > 0 && this.get('isEditing')) {
      this._showList();
    }
    else {
      this._hideList();
    }
  }.observes('_suggestedContent'),

  _selectedItemDidChange: function() {
    var sel = this.get('selectedItem');
    console.log('%@._selectedItemDidChange(%@)'.fmt(this, sel));
    this._setItemAsValue(sel);
  }.observes('selectedItem'),
  
  // PRIVATE PROPERTIES

  /** @private
    Reference to the suggestion list pane
  */
  _listPane: null,

  /** @private
    Reference to the list inside the suggestion list pane
  */
  _listView: null,

  /** @private
    Bound to _listView's selection
  */
  _listSelection: null,

  /** @private
    The list of suggested results.
  */
  _suggestedContent: null,

  /** @private
    Saves the last highlighted item in the suggestion list in case
    the user hits enter or clicks out of the text field.
  */
  _proposedItem: null,

  /** @private
    Flag used to keep track of the source of a text change.
  */
  _keyDown: NO
  
});
