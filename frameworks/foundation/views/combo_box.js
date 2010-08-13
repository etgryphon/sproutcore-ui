/*globals SCUI*/

sc_require('mixins/simple_button');
sc_require('views/localizable_list_item');

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
  
  objectsBindingDefault: SC.Binding.oneWay(),
  
  /**
    The value represented by this control.  If you have defined a 'valueKey',
    this will be 'selectedObject[valueKey]', otherwise it will be
    'selectedObject' itself.

    Setting 'value':
    
    When 'valueKey' is defined, setting 'value' will make the combo box
    attempt to find an object in 'objects' where object[valueKey] === value.
    If it can't find such an object, 'value' and 'selectedObject' will be forced
    to null. In the case where both 'objects' and 'value' are both bound to something
    and 'value' happens to update before 'objects' (so that for a small amount of time 'value' is
    not found in 'object[valueKey]s') 'value' can be set wrongly to null.
    'valueKey' is really meant for use in read-only situations.
    
    When 'valueKey' is not defined, setting 'value' to something not found in
    'objects' is just fine -- 'selectedObject' will simply be set to 'value'.
    
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
  
  localize: NO,
  
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
    Bound internally to the status of the 'objects' array, if present
  */
  status: null,

  /**
    True if ('status' & SC.Record.BUSY).
  */
  isBusy: function() {
    return (this.get('status') & SC.Record.BUSY) ? YES : NO;
  }.property('status').cacheable(),

  /**
    The drop down pane resizes automatically.  Set the minimum allowed height here.
  */
  minListHeight: 20,

  /**
    The drop down pane resizes automatically.  Set the maximum allowed height here.
  */
  maxListHeight: 200,

  /**
    When 'isBusy' is true, the combo box shows a busy indicator at the bottom of the
    drop down pane.  Set its height here.
  */
  statusIndicatorHeight: 18,

  /**
    'objects' above, filtered by 'filter', then optionally sorted.
    If 'useExternalFilter' is YES, this property does nothing but
    pass 'objects' through unchanged.
  */
  filteredObjects: function() {
    var ret, filter, objects, nameKey, name, that, shouldLocalize;

    if (this.get('useExternalFilter')) {
      ret = this.get('objects');
    }
    else {
      objects = this.get('objects') || [];
      nameKey = this.get('nameKey');

      filter = this._sanitizeFilter(this.get('filter')) || '';
      filter = filter.toLowerCase();

      shouldLocalize = this.get('localize');

      ret = [];
      that = this;

      objects.forEach(function(obj) {
        name = that._getObjectName(obj, nameKey, shouldLocalize);

        if ((SC.typeOf(name) === SC.T_STRING) && (name.toLowerCase().search(filter) >= 0)) {
          ret.push(obj);
        }
      });
    }

    return this.sortObjects(ret);
  }.property('objects', 'filter').cacheable(),

  /**
    The text field child view class.  Override this to change layout, CSS, etc.
  */
  textFieldView: SC.TextFieldView.extend({
    classNames: 'scui-combobox-text-field-view',
    layout: { top: 0, left: 0, height: 22, right: 28 }
  }),

  /**
    The drop down button view class.  Override this to change layout, CSS, etc.
  */
  dropDownButtonView: SC.ButtonView.extend({
    layout: { top: 0, right: 0, height: 24, width: 28 },
    icon: 'caret'
  }),

  displayProperties: ['isEditing'],

  // PUBLIC METHODS
  
  init: function() {
    sc_super();
    this._createListPane();
    this._valueDidChange();

    this.bind('status', SC.Binding.from('*objects.status', this).oneWay());
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
          a = a.get ? a.get(nameKey) : a[nameKey];
          b = b.get ? b.get(nameKey) : b[nameKey];
        }
        
        a = (SC.typeOf(a) === SC.T_STRING) ? a.toLowerCase() : a;
        b = (SC.typeOf(b) === SC.T_STRING) ? b.toLowerCase() : b;

        return (a < b) ? -1 : ((a > b) ? 1 : 0);
      });
    }
    
    return objects;
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
    if (this._listPane && !this._listPane.get('isPaneAttached')) {
      this.beginEditing();

      this._updateListPaneLayout();
      this._listPane.popup(this, SC.PICKER_MENU);

      // HACK: [JL] (Or is it?)  Tell the list view that its visible area
      // has changed when showing the list.  Otherwise if the list was previously
      // dismissed with the scroll bar not all the way at the top of the list,
      // the list items render with off-screen layouts -- out of sync with the
      // scroll view for some reason.
      this._listView.reload();
      // END HACK
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

  insertTab: function(evt) {
    var ret = NO;

    // If the drop-down list is open, make a tab event be an 'accept' event
    if (this._listPane && this._listPane.get('isPaneAttached')) {
      this.invokeOnce('_selectListItem'); // same action that a 'newline' event eventually triggers
      ret = YES; // absorb the event
    }
    
    return ret;
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

  _filteredObjectsLengthDidChange: function() {
    this.invokeOnce('_updateListPaneLayout');
  }.observes('*filteredObjects.length'),

  _isBusyDidChange: function() {
    this.invokeOnce('_updateListPaneLayout');
  }.observes('isBusy'),

  _selectedObjectDidChange: function() {
    var sel = this.get('selectedObject');
    var textField = this.get('textFieldView');

    // Update 'value' since the selected object changed
    this.setIfChanged('value', this._getObjectValue(sel, this.get('valueKey')));

    // Update the text in the text field as well
    if (textField) {
      textField.setIfChanged('value', this._getObjectName(sel, this.get('nameKey'), this.get('localize')));
    }
    
    // null out the filter since we aren't searching any more at this point.
    this.set('filter', null);
  }.observes('selectedObject'),

  // When the selected item ('value') changes, try to map back to a 'selectedObject'
  // as well.
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

          // Since we're using a 'valueKey', find the object where object[valueKey] === value.
          // If not found, 'selectedObject' and 'value' get forced to null.
          selectedObject = (objects && objects.isEnumerable) ? objects.findProperty(valueKey, value) : null;
          this.set('selectedObject', selectedObject);
        }
      }
      else {
        // with no 'valueKey' set, we allow setting 'value' and 'selectedObject'
        // to something not found in 'objects'
        this.setIfChanged('selectedObject', value);
      }
    }
    else {
      // When 'value' is set to null, make sure 'selectedObject' goes to null as well.
      this.set('selectedObject', null);
    }
  }.observes('value'),

  // triggered by arrowing up/down in the drop down list -- show the name
  // of the highlighted item in the text field.
  _listSelectionDidChange: function() {
    var selection = this.getPath('_listSelection.firstObject');
    var name, textField;

    if (selection && this._listPane && this._listPane.get('isPaneAttached')) {
      name = this._getObjectName(selection, this.get('nameKey'), this.get('localize'));
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
    var isBusy = this.get('isBusy');
    var spinnerHeight = this.get('statusIndicatorHeight');
    var csv = this.get('customScrollView') || SC.ScrollView;

    this._listPane = SC.PickerPane.create({
      classNames: ['scui-combobox-list-pane', 'sc-menu'],
      acceptsKeyPane: NO,
      acceptsFirstResponder: NO,

      contentView: SC.View.extend({
        layout: { left: 0, right: 0, top: 0, bottom: 0 },
        childViews: 'listView spinnerView'.w(),
        
        listView: csv.extend({
          classNames: 'scui-combobox-list-scroll-view',
          layout: { left: 0, right: 0, top: 0, bottom: isBusy ? spinnerHeight : 0 },
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
            localizeBinding: SC.Binding.from('localize', this).oneWay(),

            // A regular ListItemView, but with localization added
            exampleView: SCUI.LocalizableListItemView,
          
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

        spinnerView: SC.View.extend({
          classNames: 'scui-combobox-spinner-view',
          layout: { centerX: 0, bottom: 0, width: 100, height: spinnerHeight },
          isVisibleBinding: SC.Binding.from('isBusy', this).oneWay(),
          childViews: 'imageView messageView'.w(),
          
          imageView: SCUI.LoadingSpinnerView.extend({
            layout: { left: 0, top: 0, bottom: 0, width: 18 },
            theme: 'darkTrans',
            callCountBinding: SC.Binding.from('isBusy', this).oneWay().transform(function(value) {
              value = value ? 1 : 0;
              return value;
            })
          }),
          
          messageView: SC.LabelView.extend({
            layout: { left: 25, top: 0, bottom: 0, right: 0 },
            valueBinding: SC.Binding.from('status', this).oneWay().transform(function(value) {
              value = (value === SC.Record.BUSY_LOADING) ? "Loading...".loc() : "Refreshing...".loc(); // this view is only visible when status is busy
              return value;
            })
          })
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

    this._listView = this._listPane.getPath('contentView.listView.contentView');
    this._listScrollView = this._listPane.getPath('contentView.listView');
  },

  /**
    Invoked whenever the contents of the drop down pane change.  This method
    autosizes the pane appropriately.
  */
  _updateListPaneLayout: function() {
    var rowHeight, length, width, height, frame, minHeight, maxHeight, spinnerHeight, isBusy;

    if (this._listView && this._listPane && this._listScrollView) {
      frame = this.get('frame');
      width = frame ? frame.width : 200;

      isBusy = this.get('isBusy');
      spinnerHeight = this.get('statusIndicatorHeight');
      rowHeight = this._listView.get('rowHeight') || 18;

      // even when list is empty, show at least one row's worth of height,
      // unless we're showing the busy indicator there
      length = this.getPath('filteredObjects.length') || (isBusy ? 0 : 1);

      height = (rowHeight * length) + (isBusy ? spinnerHeight : 0);
      height = Math.min(height, this.get('maxListHeight')); // limit to max height
      height = Math.max(height, this.get('minListHeight')); // but be sure it is always at least the min height

      this._listScrollView.adjust({ bottom: isBusy ? spinnerHeight : 0 });
      this._listPane.adjust({ width: width, height: height });
      this._listPane.updateLayout(); // force pane to re-render layout
      this._listPane.positionPane(); // since size has changed, force pane to recompute its position on the screen
    }
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
    return str ? str.replace(this._sanitizeRegEx, '\\$1') : str;
  },

  _getObjectName: function(obj, nameKey, shouldLocalize) {
    var name = obj ? (nameKey ? (obj.get ? obj.get(nameKey) : obj[nameKey]) : obj) : null;

    // optionally localize
    if (shouldLocalize && name && name.loc) {
      name = name.loc();
    }
    
    return name;
  },

  _getObjectValue: function(obj, valueKey) {
    return obj ? (valueKey ? (obj.get ? obj.get(valueKey) : obj[valueKey]) : obj) : null;
  },

  // PRIVATE PROPERTIES
  
  _listPane: null,
  _listScrollView: null,
  _listView: null,
  _listSelection: null,
  
  _keyDown: NO,
  _shouldUpdateFilter: NO,
  
  /**
    Do this once here so we don't have to spend cpu time recreating this every time the search filter changes
  */
  _sanitizeRegEx: new RegExp('(\\' + ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\'].join('|\\') + ')', 'g')

});

