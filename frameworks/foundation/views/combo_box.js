sc_require('mixins/simple_button');

/** @class

  This view creates a combo-box text field view with a dropdown list view
  for type ahead suggestions; useful as a search field.
  
  'objects' should be set to an array of candidate items.
  'value' will be the item selected, just like any SC.Control.

  @extends SC.View, SC.Control, SC.Editable
  @author Jonathan Lewis
*/

SCUI.ComboBoxView = SC.View.extend( SC.Control, SC.Editable, {

  // PUBLIC PROPERTIES

  classNames: 'scui-combobox-view',
  
  isEditable: function() {
    return this.get('isEnabled');
  }.property('isEnabled').cacheable(),

  /**
    An array of items that will form the menu you want to show.
  */
  objects: null,
  
  /**
    The value represented by this control.  If you have defined a 'valueKey',
    this will be 'selectedObject[valueKey]', otherwise it will be
    'selectedObject' itself.
    
    If 'value' gets set to a value not found in 'objects' or, if 'valueKey' is
    defined, in 'object[valueKey]s', then 'value' and 'selectedObject' will be
    null out.

    Setting this to null also forces 'selectedObject' to null.
    
    @property {Object}
  */
  value: null,

  /**
    Provided because we have to keep track of this internally -- the
    actual item from 'objects' that was selected, regardless of how we are
    displaying it or what property on it is considered its 'value'.
    
    Usually you won't use this -- 'value' is the normal property for this
    purpose.  However, this is also fully bindable, etc.
  */
  selectedObject: null,

  /**
     Set this to a non-null value to use a key from the passed set of objects
     as the value for the options popup.  If you don't set this, then the
     objects themselves will be used as the value.
  */
  valueKey: null,
  
  /**
    If you set this to a non-null value, then the name shown for each 
    menu item will be pulled from the object using the named property.
    if this is null, the collection objects themselves will be used.
  */
  nameKey: null,

  /**
    If this is non-null, the drop down list will add an icon for each
    object in the list.
  */
  iconKey: null,

  /**
   If you set this to a non-null value, then the value of this key will
   be used to sort the objects.  If this is not set, then nameKey will
   be used.
  */
  sortKey: null,
  
  /**
    if true, it means that no sorting will occur, objects will appear 
    in the same order as in the array
  */  
  disableSort: NO,
  
  /**
    Bound to the hint property on the combo box's text field view.
  */
  hint: null,

  /**
    Search string being used to filter the 'objects' array above.
    Unless you explicitly set it, it is always whatever was _typed_
    in the text field view (text that is a result of key presses).
    Note that this is not always the same as the text in the field, since
    that can also change as a result of 'value' (the selected object)
    changing, or the user using arrow keys to highlight objects in the
    drop down list.  You want to see the names of these objects in the text
    field, but you don't want to trigger a filter change in those cases,
    so it doesn't.
  */
  filter: null,

  /**
    If you do not want to use the combo box's internal filtering
    algorithm, set this to YES.  In this case, if you want to filter
    'objects' in your own way, you would need to watch the 'filter'
    property and update 'objects' as desired.
  */
  useExternalFilter: NO,

  /**
    'objects' above, filtered by 'filter', then optionally sorted.
    If 'useExternalFilter' is YES, this property does nothing but
    pass 'objects' through unchanged.
  */
  filteredObjects: function() {
    var ret, filter, objects, nameKey, name, that;

    if (this.get('useExternalFilter')) {
      ret = this.get('objects');
    }
    else {
      objects = this.get('objects') || [];
      nameKey = this.get('nameKey');

      filter = this._sanitizeFilter(this.get('filter')) || '';
      filter = filter.toLowerCase();

      ret = [];
      that = this;

      objects.forEach(function(obj) {
        name = that._getObjectName(obj, nameKey);

        if ((SC.typeOf(name) === SC.T_STRING) && (name.toLowerCase().search(filter) >= 0)) {
          ret.push(obj);
        }
      });
    }

    return this.sortObjects(ret);
  }.property('objects', 'filter').cacheable(),

  textFieldView: SC.TextFieldView.extend({
    classNames: 'scui-combobox-text-field-view',
    layout: { left: 0, top: 0, bottom: 0, right: 22 }
  }),
  
  dropDownButtonView: SC.View.extend( SCUI.SimpleButton, {
    classNames: 'scui-combobox-dropdown-button-view',
    layout: { right: 0, top: 0, bottom: 0, width: 22 }
  }),

  displayProperties: ['isEditing'],

  // PUBLIC METHODS
  
  init: function() {
    sc_super();
    this._createListPane();
    this._valueDidChange();
  },
  
  createChildViews: function() {
    var childViews = [], view;
    var isEnabled = this.get('isEnabled');
    
    view = this.get('textFieldView');
    if (SC.kindOf(view, SC.View) && view.isClass) {
      view = this.createChildView(view, {
        isEnabled: isEnabled,
        hintBinding: SC.Binding.from('hint', this),
        editableDelegate: this, // pass SC.Editable calls up to the owner view
        keyDelegate: this, // the text field will be the key responder, but offer them to the owner view first

        // Override key handlers to first offer them to the delegate.
        // Only call base class implementation if the delegate refuses the event.
        keyDown: function(evt) {
          var del = this.get('keyDelegate');
          return (del && del.keyDown && del.keyDown(evt)) || sc_super();
        },
        
        keyUp: function(evt) {
          var del = this.get('keyDelegate');
          return (del && del.keyUp && del.keyUp(evt)) || sc_super();
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
      });
      childViews.push(view);
      this.set('textFieldView', view);
    }
    else {
      this.set('textFieldView', null);
    }

    view = this.get('dropDownButtonView');
    if (SC.kindOf(view, SC.View) && view.isClass) {
      view = this.createChildView(view, {
        isEnabled: isEnabled,
        target: this,
        action: 'toggleList'
      });
      childViews.push(view);
      this.set('dropDownButtonView', view);
    }
    else {
      this.set('dropDownButtonView', null);
    }

    this.set('childViews', childViews);
  },

  // for styling purposes, add a 'focus' CSS class when
  // the combo box is in editing mode
  renderMixin: function(context, firstTime) {
    context.setClass('focus', this.get('isEditing'));
  },

  /**
    override this method to implement your own sorting of the menu. By
    default, menu items are sorted using the value shown or the sortKey

    @param objects the unsorted array of objects to display.
    @returns sorted array of objects
  */
  sortObjects: function(objects) {
    var nameKey;

    if (!this.get('disableSort') && objects && objects.sort){
      nameKey = this.get('sortKey') || this.get('nameKey') ;

      objects = objects.sort(function(a, b) {
        if (nameKey) {
          a = a.get ? a.get(nameKey) : a[nameKey] ;
          b = b.get ? b.get(nameKey) : b[nameKey] ;
        }
        return (a < b) ? -1 : ((a > b) ? 1 : 0) ;
      });
    }
    
    return objects ;
  },

  /**
    This may be called directly, or triggered by the
    text field beginning editing.
  */
  beginEditing: function() {
    var textField = this.get('textFieldView');

    if (!this.get('isEditable')) {
      return NO;
    }
    
    if (this.get('isEditing')) {
      return YES;
    }
    
    this.set('isEditing', YES);
    this.set('filter', null);
    
    if (textField && !textField.get('isEditing')) {
      textField.beginEditing();
    }

    return YES;
  },

  /**
    This may be called directly, or triggered by the
    text field committing editing.
  */
  commitEditing: function() {
    var textField = this.get('textFieldView');

    if (this.get('isEditing')) {
      // force it walk through its sequence one more time
      // to make sure text field display is in sync with selected stuff
      this._selectedObjectDidChange();

      this.set('isEditing', NO);
      this.hideList();
    }

    if (textField && textField.get('isEditing')) {
      textField.commitEditing();
    }
    
    return YES;
  },

  toggleList: function() {
    if (this._listPane && this._listPane.get('isPaneAttached')) {
      this.hideList();
    }
    else {
      this.showList();
    }
  },

  // Show the drop down list if not already visible.
  showList: function() {
    var frame, width;

    if (this._listPane && !this._listPane.get('isPaneAttached')) {
      this.beginEditing();

      frame = this.get('frame');
      width = frame ? frame.width : 200;
    
      this._listPane.adjust({ width: width, height: 150 });
      this._listPane.popup(this, SC.PICKER_MENU);
    }
  },
  
  // Hide the drop down list if visible.
  hideList: function() {
    if (this._listPane && this._listPane.get('isPaneAttached')) {
      this._listPane.remove();
    }
  },
  
  // The following key events come to us from the text field
  // view.  It is the key responder, but we are its delegate.
  keyDown: function(evt) {
    this._keyDown = YES;
    this._shouldUpdateFilter = NO; // only goes to true if typing text, which we'll discover below
    return this.interpretKeyEvents(evt) ? YES : NO;
  },

  keyUp: function(evt) {
    var ret = NO;

    // If the text field is empty, the browser doesn't always
    // send a keyDown() event, only a keyUp() event for arrow keys in Firefox, for example.
    // To avoid double key handling, check to be sure we didn't get a keyDown()
    // before attempting to use the event.
    if (!this._keyDown) {
      this._shouldUpdateFilter = NO;
      ret = this.interpretKeyEvents(evt) ? YES : NO;
    }

    this._keyDown = NO;
    return ret;
  },
  
  insertText: function(evt) {
    this._shouldUpdateFilter = YES; // someone typed something
    this.showList();
    return NO;
  },
  
  deleteBackward: function(evt) {
    this._shouldUpdateFilter = YES; // someone typed something
    this.showList();
    return NO;
  },
  
  deleteForward: function(evt) {
    this._shouldUpdateFilter = YES;
    this.showList();
    return NO;
  },

  // Send this event to the drop down list
  moveDown: function(evt) {
    if (this._listPane && this._listView) {
      if (this._listPane.get('isPaneAttached')) {
        this._listView.moveDown(evt);
      }
      else {
        this.showList();
      }
    }
    return YES;
  },

  // Send this event to the drop down list
  moveUp: function(evt) {
    if (this._listPane && this._listView) {
      if (this._listPane.get('isPaneAttached')) {
        this._listView.moveUp(evt);
      }
      else {
        this.showList();
      }
    }
    return YES;
  },

  // Send this event to the drop down list to trigger
  // the default action on the selection.
  insertNewline: function(evt) {
    if (this._listPane && this._listPane.get('isPaneAttached')) {
      return this._listView.insertNewline(evt); // invokes default action on ListView, same as double-click
    }
    return NO;
  },

  // escape key handler
  cancel: function(evt) {
    if (this._listPane && this._listPane.get('isPaneAttached')) {
      this.hideList();
    }
    return NO; // don't absorb it; let the text field have fun with this one
  },
  
  // PRIVATE PROPERTIES

  _isEnabledDidChange: function() {
    var view;
    var isEnabled = this.get('isEnabled');
    
    if (!isEnabled) {
      this.commitEditing();
    }
    
    view = this.get('textFieldView');
    if (view && view.set) {
      view.set('isEnabled', isEnabled);
    }
    
    view = this.get('dropDownButtonView');
    if (view && view.set) {
      view.set('isEnabled', isEnabled);
    }
  }.observes('isEnabled'),

  // Have to add an array observer to invalidate 'filteredObjects'
  // since in some cases the entire 'objects' array-like object doesn't
  // get replaced, just modified.
  _objectsDidChange: function() {
    this.notifyPropertyChange('filteredObjects'); // force a recompute next time 'filteredObjects' is asked for
  }.observes('*objects.[]'),

  _selectedObjectDidChange: function() {
    var sel = this.get('selectedObject');
    var textField = this.get('textFieldView');

    this.setIfChanged('value', this._getObjectValue(sel, this.get('valueKey')));

    if (textField) {
      textField.setIfChanged('value', this._getObjectName(sel, this.get('nameKey')));
    }
    
    // null out the filter since we aren't searching any more at this point.
    this.set('filter', null);
  }.observes('selectedObject'),

  // when the selected item ('value') changes, keep the text
  // in the text field view in sync
  _valueDidChange: function() {
    var value = this.get('value');
    var selectedObject = this.get('selectedObject');
    var valueKey = this.get('valueKey');
    var objects;

    if (value) {
      if (valueKey) {
        // we need to update 'selectedObject' if 'selectedObject[valueKey]' is not 'value
        if (value !== this._getObjectValue(selectedObject, valueKey)) {
          objects = this.get('objects');
          selectedObject = (objects && objects.isEnumerable) ? objects.findProperty(valueKey, value) : null;
          this.set('selectedObject', selectedObject);
        }
      }
      else {
        // we need to update 'selectedObject' if 'selectedObject' is not 'value'
        if (value !== selectedObject) {
          objects = this.get('objects');
          selectedObject = (objects && objects.indexOf && (objects.indexOf(value) >= 0)) ? value : null;
          this.set('selectedObject', selectedObject);
        }
      }
    }
    else {
      // If no value, make sure there is no selected object either
      this.setIfChanged('selectedObject', null);
    }
  }.observes('value'),

  // triggered by arrowing up/down in the drop down list -- show the name
  // of the highlighted item in the text field.
  _listSelectionDidChange: function() {
    var selection = this.getPath('_listSelection.firstObject');
    var name, textField;

    if (selection && this._listPane && this._listPane.get('isPaneAttached')) {
      name = this._getObjectName(selection, this.get('nameKey'));
      textField = this.get('textFieldView');

      if (textField) {
        textField.setIfChanged('value', name);
      }
    }
  }.observes('_listSelection'),

  // If the text field value changed as a result of typing,
  // update the filter.
  _textFieldValueDidChange: function() {
    if (this._shouldUpdateFilter) {
      this._shouldUpdateFilter = NO;
      this.setIfChanged('filter', this.getPath('textFieldView.value'));
    }
  }.observes('*textFieldView.value'),

  _createListPane: function() {
    this._listPane = SC.PickerPane.create({
      classNames: 'scui-combobox-list-pane',
      acceptsKeyPane: NO,
      acceptsFirstResponder: NO,

      contentView: SC.ScrollView.extend({
        layout: { left: 0, right: 0, top: 0, bottom: 0 },
        hasHorizontalScroller: NO,
        
        contentView: SC.ListView.design({
          classNames: 'scui-combobox-list-view',
          layout: { left: 0, right: 0, top: 0, bottom: 0 },
          allowsMultipleSelection: NO,
          target: this,
          action: '_selectListItem', // do this when [Enter] is pressed, for example
          contentBinding: SC.Binding.from('filteredObjects', this).oneWay(),
          contentValueKey: this.get('nameKey'),
          hasContentIcon: this.get('iconKey') ? YES : NO,
          contentIconKey: this.get('iconKey'),
          selectionBinding: SC.Binding.from('_listSelection', this),
          
          // transparently notice mouseUp and use it as trigger
          // to close the list pane
          mouseUp: function() {
            var ret = sc_super();
            var target = this.get('target');
            var action = this.get('action');
            if (target && action && target.invokeLater) {
              target.invokeLater(action);
            }
            return ret;
          }
        })
      }),

      // HACK: [JL] Override mouseDown to return NO since without this
      // Firefox won't detect clicks on the scroll buttons.
      // This disables pane-dragging functionality for the picker pane, but we
      // don't need that.
      mouseDown: function(evt) {
        sc_super();
        return NO;
      }
    });
    
    this._listView = this._listPane.getPath('contentView.contentView');
  },

  // default action for the list view
  _selectListItem: function() {
    var selection = this._listView ? this._listView.getPath('selection.firstObject') : null;
    if (selection) {
      this.set('selectedObject', selection);
    }
    this.hideList();
  },

  _sanitizeFilter: function(str){
    var specials, s;

    if (str) {
      specials = [
          '/', '.', '*', '+', '?', '|',
          '(', ')', '[', ']', '{', '}', '\\'
      ];
      
      s = new RegExp('(\\' + specials.join('|\\') + ')', 'g');
      return str.replace(s, '\\$1');
    }
    return str;
  },

  _getObjectName: function(obj, nameKey) {
    return obj ? (nameKey ? (obj.get ? obj.get(nameKey) : obj[nameKey]) : obj) : null;
  },

  _getObjectValue: function(obj, valueKey) {
    return obj ? (valueKey ? (obj.get ? obj.get(valueKey) : obj[valueKey]) : obj) : null;
  },

  // PRIVATE PROPERTIES
  
  _listPane: null,
  _listView: null,
  _listSelection: null,
  
  _keyDown: NO,
  _shouldUpdateFilter: NO

});
