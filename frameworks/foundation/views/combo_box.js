/*globals SCUI sc_static*/

sc_require('mixins/simple_button');

/** @class

  This view creates a combo-box text field view with a dropdown list view
  for type ahead suggestions; useful as a search field.
  
  'objects' should be set to an array of candidate items.
  'value' will be the item selected, just like any SC.Control.

  @extends SC.View, SC.Control, SC.Editable
  @author Jonathan Lewis
  @author Peter Bergström
*/

SCUI.ComboBoxView = SC.View.extend( SC.Control, SC.Editable, {

  // PUBLIC PROPERTIES

  classNames: 'scui-combobox-view',
  
  isEditable: function() {
    return this.get('isEnabled');
  }.property('isEnabled').cacheable(),

  /*
    The item selected in the combo box.  Every time a different item is chosen in
    the drop-down list, this property will be updated.

    This property may be used in conjunction with 'valueKey', in which case this
    property will be equal to 'selectedObject[valueKey]' when an item is selected
    in the drop-down list.
    
    If no 'valueKey' is set, then 'value' will be equal to the selected item 'selectedObject'
    itself.
  */
  value: null,

  /**
     Set this to a non-null value to use a key from the passed set of objects
     as the value for the options popup.  If you don't set this, then the
     objects themselves will be used as the value.
  */
  valueKey: null,

  /**
    An array of items that will form the menu you want to show.
  */
  objects: null,
  
  objectsBindingDefault: SC.Binding.oneWay(),

  /**
    If you set this to a non-null value, then the name shown for each 
    menu item will be pulled from the object using the named property.
    if this is null, the collection objects themselves will be used.
  */
  nameKey: null,

  /*
    @optional
    If set to a number, will truncate the item display names in the drop-down
    list to this length.  No truncation if null.
  */
  maxNameLength: null,

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
    if true, the object list names will be localized.
  */
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
    If you want to highlight the filtered text, then set this to YES.
  */
  highlightFilterOnListItem: NO,
  
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
    Row height for each item.
  */
  rowHeight: 18,

  /**
    The drop down pane resizes automatically.  Set the minimum allowed height here.
  */
  minListHeight: 18,

  /**
    The drop down pane resizes automatically.  Set the maximum allowed height here.
  */
  maxListHeight: 194, // 10 rows at 18px, plus 7px margin on top and bottom
  
  /**
    If a custom class name is desired for the picker, add it here.
  */
  customPickerClassName: null,
  
  /**
    The drop down pane width
  */
  dropDownMenuWidth: null,
  

  /**
    When 'isBusy' is true, the combo box shows a busy indicator at the bottom of the
    drop down pane.  Set its height here.
  */
  statusIndicatorHeight: 20,

  /**
    True allows the user to clear the value by deleting all characters in the textfield.  False will reset the textfield to the last entered value.
  */
  canDeleteValue: NO,

  /**
    'objects' above, filtered by 'filter', then optionally sorted.
    If 'useExternalFilter' is YES, this property does nothing but
    pass 'objects' through unchanged.
  */
  filteredObjects: function() {
    var ret, objects, nameKey, name, that, shouldLocalize;
    var filter = this.get('filter');

    if (this.get('useExternalFilter') || !filter) {
      ret = this.get('objects');
    }
    else {
      objects = this.get('objects') || [];
      nameKey = this.get('nameKey');

      filter = this._sanitizeFilter(filter) || '';
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

  /*
    The actual item from the 'objects' list that was selected, mainly for internal use,
    though it is bindable if desired.
    
    If 'valueKey' is in use, then when 'value' is changed, this property will attempt
    to update itself by searching the 'objects' list for an object P where P[valueKey]
    equals 'value'.  Otherwise, this property just makes sure that 'selectedObject' and
    'value' are always the same.
    
    Note that when using 'value' in conjunction with 'valueKey', 'selectedObject' will be null
    if an appropriate object in 'objects' cannot be found.
  */
  selectedObject: function(key, value) {
    var objects, comboBoxValue, valueKey;

    if (value !== undefined) {
      this.setIfChanged('value', this._getObjectValue(value, this.get('valueKey')));
    }
    else {
      if (this.get('valueKey')) {
        comboBoxValue = this.get('value');
        valueKey = this.get('valueKey');
        
        if (this._getObjectValue(this._lastSelectedObject, valueKey) !== comboBoxValue) {
          objects = this.get('objects');
          if (objects && objects.isEnumerable) {
            value = objects.findProperty(valueKey, comboBoxValue);
          }
        }
        else {
          value = this._lastSelectedObject;
        }
      }
      else {
        value = this.get('value');
      }
    }

    this._lastSelectedObject = value;

    return value;
  }.property('value').cacheable(),

  selectedObjectName: function() {
    return this._getObjectName(this.get('selectedObject'), this.get('nameKey'), this.get('localize'));
  }.property('selectedObject').cacheable(),

  selectedObjectIcon: function() {
    return this._getObjectIcon(this.get('selectedObject'), this.get('iconKey'));
  }.property('selectedObject').cacheable(),

  /**
    The text field child view class.  Override this to change layout, CSS, etc.
  */
  textFieldView: SC.TextFieldView.extend({
    classNames: 'scui-combobox-text-field-view',
    layout: { top: 0, left: 0, height: 22, right: 28 },
    spellCheckEnabled: NO
  }),

  /**
    The drop down button view class.  Override this to change layout, CSS, etc.
  */
  dropDownButtonView: SC.ButtonView.extend({
    layout: { top: 0, right: 0, height: 24, width: 28 },
    icon: 'caret'
  }),
  
  /*
    Set at design time only.  Should be a view class specified at design time.
    At run time, if used, it will be replaced with an instance of the type as a
    convenience shortcut for testing purposes.  This property will not be used
    unless you set 'iconKey' above, indicating that you want to show icons for
    your list items and your selected item.
  */
  iconView: SC.ImageView.extend({
    layout: { left: 7, top: 4, width: 16, height: 16 }
  }),

  /*
    @private
  */
  leftAccessoryView: function() {
    var view = this.get('iconView');

    if (SC.kindOf(view, SC.View)) {
      view = view.create();
    }
    else {
      view = null;
    }
    this.set('iconView', view);

    return view;
  }.property().cacheable(), // only run once, then cache
  
  displayProperties: ['isEditing'],

  // PUBLIC METHODS
  
  init: function() {
    sc_super();
    this._createListPane();
    this.bind('status', SC.Binding.from('*objects.status', this).oneWay());
  },
  
  willDestroyLayer: function() {
    if (this._listPane) {
      this._listPane.destroy();
    }
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

    if (!this.get('disableSort') && objects) {
      if (!objects.sort && objects.toArray) {
        objects = objects.toArray();
      }
      if (objects.sort) {
        nameKey = this.get('sortKey') || this.get('nameKey');

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
      // sync text field value with name of selected object
      this._selectedObjectNameDidChange();

      this.set('isEditing', NO);
      // in IE, as soon as you the user browses through the results in the picker pane by 
      // clicking on the scroll bar or the scroll thumb, the textfield loses focus causing 
      // commitEditing to be called and subsequently hideList which makes for a very annoying 
      // experience. With this change, clicking outside the pane will hide it (same as original behavior), 
      // however, if the user directly shifts focus to another text field, then the pane 
      // won't be removed. This behavior is still buggy but less buggy than it was before.
      if (!SC.browser.msie) {
        this.hideList();
      }
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
  
  _checkDeletedAll: function(delBackward) {
    if (!this.get('canDeleteValue')) return;
    var value = this.get('textFieldView').get('value'),
        selection = this.get('textFieldView').get('selection'),
        wouldDeleteLastChar = NO;
    if (!value || !value.length) {
      wouldDeleteLastChar = YES;
    } else if (value.length === selection.length()) {
      wouldDeleteLastChar = YES;
    } else if (value.length === 1 && selection.start === (delBackward ? 1 : 0)) {
      wouldDeleteLastChar = YES;
    }

    if (wouldDeleteLastChar) {
      this.set('selectedObject', null);
      this.set('value', null);
    }
  },

  deleteBackward: function(evt) {
    this._checkDeletedAll(YES);
    this._shouldUpdateFilter = YES; // someone typed something
    this.showList();
    return NO;
  },
  
  deleteForward: function(evt) {
    this._checkDeletedAll(NO);
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
    //console.log('%@._objectsDidChange(%@)'.fmt(this, this.get('objects')));

    this.notifyPropertyChange('filteredObjects'); // force a recompute next time 'filteredObjects' is asked for
    this.notifyPropertyChange('selectedObject');
  }.observes('*objects.[]'),

  _filteredObjectsLengthDidChange: function() {
    this.invokeOnce('_updateListPaneLayout');
  }.observes('*filteredObjects.length'),

  _isBusyDidChange: function() {
    this.invokeOnce('_updateListPaneLayout');
  }.observes('isBusy'),

  /*
    Triggered by arrowing up/down in the drop down list -- show the name
    of the highlighted item in the text field.
  */
  _listSelectionDidChange: function() {
    var selection = this.getPath('_listSelection.firstObject');
    var name;
    
    if (selection && this._listPane && this._listPane.get('isPaneAttached')) {
      name = this._getObjectName(selection, this.get('nameKey'), this.get('localize'));
      this.setPathIfChanged('textFieldView.value', name);
      this._setIcon(this._getObjectIcon(selection, this.get('iconKey')));
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

  _selectedObjectDidChange: function() {
    var selectedObject = this.get('selectedObject');

    if (this.getPath('_listSelection.firstObject') !== selectedObject) {
      this.setPath('_listSelection', selectedObject ? SC.SelectionSet.create().addObject(selectedObject) : SC.SelectionSet.EMPTY);
    }
  }.observes('selectedObject'),

  /*
    Observer added dynamically in init() fires this function
  */
  _selectedObjectNameDidChange: function() {
    this.setPathIfChanged('textFieldView.value', this.get('selectedObjectName'));
  }.observes('selectedObjectName'),

  _selectedObjectIconDidChange: function() {
    this._setIcon(this.get('selectedObjectIcon'));
  }.observes('selectedObjectIcon'),

  _createListPane: function() {
    var isBusy = this.get('isBusy');
    var spinnerHeight = this.get('statusIndicatorHeight');
    var csv = this.get('customScrollView') || SC.ScrollView;

    var classNames = ['scui-combobox-list-pane', 'sc-menu'],
        customPickerClassName = this.get('customPickerClassName');
    
    if(customPickerClassName) {
      classNames.push(customPickerClassName);
    }

    this._listPane = SC.PickerPane.create({
      classNames: classNames,
      acceptsKeyPane: NO,
      acceptsFirstResponder: NO,

      contentView: SC.View.extend({
        layout: { left: 0, right: 0, top: 4, bottom: 4 },
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
            rowHeight: this.get('rowHeight'),
            action: '_selectListItem', // do this when [Enter] is pressed, for example
            contentBinding: SC.Binding.from('filteredObjects', this).oneWay(),
            contentValueKey: this.get('nameKey'),
            hasContentIcon: this.get('iconKey') ? YES : NO,
            contentIconKey: this.get('iconKey'),
            selectionBinding: SC.Binding.from('_listSelection', this),
            localizeBinding: SC.Binding.from('localize', this).oneWay(),
            actOnSelect: SC.platform.touch,

            // A regular ListItemView, but with localization added
            exampleView: SC.ListItemView.extend({
              maxNameLength: this.get('maxNameLength'),
              localize: this.get('localize'),
              
              displayProperties: ['highlightSpan'],

              highlightFilteredSpan: this.get('highlightFilterOnListItem'),

              comboBoxView: this,

              renderLabel: function(context, label) {
                
                var maxLength = this.get('maxNameLength');
                
                if (!SC.none(maxLength)) {
                  label = this.truncateMaxLength(label, maxLength);
                }

                if(this.get('highlightFilteredSpan')) {
                  var comboBoxView = this.get('comboBoxView');
                  
                  if(comboBoxView) {
                    var filter = comboBoxView.get('filter'),
                        regex;

                    if(filter.length > 1) {
                      regex = new RegExp('(' + comboBoxView._sanitizeFilter(filter) + ')', 'gi');
                      label = label.replace(regex, '<span class="highlight-filtered-text">$1</span>');
                    }
                  }
                }
                
                context.push('<label>', label || '', '</label>');

              },
              
              truncateMaxLength: function(str, maxLength) {
                var i, frontLength, endLength, ret = str;

                if ((SC.typeOf(str) === SC.T_STRING) && (str.length > maxLength)) {
                  // split character budget between beginning and end of the string
                  frontLength = Math.max(Math.ceil((maxLength - 3) / 2), 0);
                  endLength = Math.max(maxLength - 3 - frontLength, 0);

                  // grab segment from front of string
                  ret = str.substring(0, frontLength);

                  // Add up to three ellipses
                  for (i = 0; (i < 3) && ((i + frontLength) < maxLength); i++) {
                    ret = ret + '.';
                  }

                  // append segment from end of string
                  ret = ret + str.substring(str.length - endLength);
                }

                return ret;
              }
            }),
          
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
      })
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
      width = this.get('dropDownMenuWidth') ? this.get('dropDownMenuWidth') : frame ? frame.width : 200;

      isBusy = this.get('isBusy');
      spinnerHeight = this.get('statusIndicatorHeight');
      rowHeight = this._listView.get('rowHeight') || this.get('rowHeight');

      // even when list is empty, show at least one row's worth of height,
      // unless we're showing the busy indicator there
      length = this.getPath('filteredObjects.length') || (isBusy ? 0 : 1);

      height = (rowHeight * length) + (isBusy ? spinnerHeight : 0) + 14; // content view of pane is inset by a total of 7px top and bottom, so accounting for that
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
    var len = this.getPath('filteredObjects.length'),
        lv = this._listView,
        selection = lv ? lv.getPath('selection.firstObject') : null;
    
    if (lv && len === 1) {
      var filter = this.get('filter'),
          obj = lv.getPath('content').objectAt(0),
          value = obj.get ? obj.get(this.get('nameKey')) : obj[this.get('nameKey')];
          
      if (filter && value && (value.toLowerCase() === filter.toLowerCase())) {
        selection = obj;
      } 
    }
    
    if (selection) this.setIfChanged('selectedObject', selection);
    this.hideList();
  },

  _sanitizeFilter: function(str){
    return str ? str.replace(this._sanitizeRegEx, '\\$1') : str;
  },

  _setIcon: function(icon) {
    if (icon) {
      this.setPathIfChanged('leftAccessoryView.value', icon);
      this.setPathIfChanged('textFieldView.leftAccessoryView', this.get('leftAccessoryView'));
    }
    else {
      this.setPathIfChanged('textFieldView.leftAccessoryView', null);
    }
  },

  _getObjectName: function(obj, nameKey, shouldLocalize) {
    var name = obj ? (nameKey ? (obj.get ? obj.get(nameKey) : obj[nameKey]) : obj) : null;

    // optionally localize
    if (shouldLocalize && name && name.loc) {
      name = name.loc();
    }
    
    return name;
  },

  _getObjectIcon: function(obj, iconKey) {
    var ret = null;

    if (obj && iconKey) {
      ret = (obj.get ? obj.get(iconKey) : obj[iconKey]) || sc_static('blank');
    }
    
    return ret;
  },

  _getObjectValue: function(obj, valueKey) {
    return obj ? (valueKey ? (obj.get ? obj.get(valueKey) : obj[valueKey]) : obj) : null;
  },

  // PRIVATE PROPERTIES
  
  _lastSelectedObject: null,
  
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

