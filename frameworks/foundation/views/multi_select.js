/*globals SCUI*/

sc_require('views/combo_box');

/*
  @class
  @extends SC.View
  @author Jonathan Lewis
  
  MultiSelectView is a composite view control that provides an interface for
  selecting multiple items from a list.  The control consists of a combo box for
  selecting an item, an 'add' button, and a list view showing the currently selected
  items.  'Remove' and 'Clear' buttons handle item deselection.

*/

SCUI.MultiSelectView = SC.View.extend({

  // PUBLIC PROPERTIES

  classNames: 'scui-multi-select-view',

  /*
    Enumerable pool of items that can be multi-selected.  Becomes the content
    of the combo box.
  */
  objects: null,

  /*
    @optional
    Specifies the property on each item in 'objects' that contains the display name for the item.
  */
  nameKey: null,
  
  /*
    An SC.SelectionSet containing the list of items selected from 'objects'
    via the 'add' button on the view.
  */
  selection: null,

  /*
    @read-only
    Pointer to the combo box view inside this control.
  */
  comboBoxView: null,

  /*
    The currently selected item in the combo box.
  */
  comboBoxSelectedObject: null,
  
  /*
    @read-only
  */
  listContent: function() {
    var sel = this.get('selection');
    var ret = (sel && sel.isEnumerable) ? sel.toArray() : [];
    ret.set('allowsMultipleSelection', YES); // ugly, but SC.ListView looks to its content for this setting.
    return ret;
  }.property('selection').cacheable(),

  /*
    The current selection on the list view.
  */
  listSelection: null,
  
  // PUBLIC METHODS

  clearSelection: function(obj) {
    this.set('selection', SC.SelectionSet.EMPTY);
    this.set('listSelection', SC.SelectionSet.EMPTY);
  },

  createChildViews: function() {
    var childViews = [], view, nameKey = this.get('nameKey');

    view = this.createChildView(SCUI.ComboBoxView, {
      layout: { left: 0, right: 85, top: 0, height: 24 },
      objectsBinding: SC.Binding.from('objects', this).oneWay(),
      selectedObjectBinding: SC.Binding.from('comboBoxSelectedObject', this),
      nameKey: nameKey
    });
    childViews.push(view);
    this.set('comboBoxView', view);

    view = this.createChildView(SC.ButtonView, {
      layout: { right: 0, top: 0, width: 80, height: 24 },
      title: "Add".loc(),
      target: this,
      action: '_addSelectedObject',
      isEnabledBinding: SC.Binding.from('comboBoxSelectedObject', this).bool().oneWay()
    });
    childViews.push(view);

    view = this.createChildView(SC.ScrollView, {
      layout: { left: 0, right: 0, top: 29, bottom: 29 },
      contentView: SC.ListView.extend({
        contentBinding: SC.Binding.from('listContent', this),
        selectionBinding: SC.Binding.from('listSelection', this),
        contentValueKey: nameKey,
        allowDeselectAll: YES,
        allowsMultipleSelection: YES
      })
    });
    childViews.push(view);

    view = this.createChildView(SC.ButtonView, {
      layout: { left: 0, bottom: 0, width: 80, height: 24 },
      title: "Remove".loc(),
      target: this,
      action: '_removeSelectedObjects',
      isEnabled: NO,
      isEnabledBinding: SC.Binding.from('*listSelection.length', this).bool().oneWay()
    });
    childViews.push(view);
    
    view = this.createChildView(SC.ButtonView, {
      layout: { right: 0, bottom: 0, width: 80, height: 24 },
      title: "Clear".loc(),
      target: this,
      action: 'clearSelection',
      isEnabled: NO,
      isEnabledBinding: SC.Binding.from('*listContent.length', this).bool().oneWay()
    });
    childViews.push(view);

    this.set('childViews', childViews);
  },

  // PRIVATE METHODS
  
  _addSelectedObject: function() {
    var sel, temp;
    var obj = this.get('comboBoxSelectedObject');
    
    if (obj) {
      sel = this.get('selection');

      if (!sel) {
        sel = SC.SelectionSet.create();
        sel.addObject(obj);
        this.set('selection', sel);
      }
      else if (sel.get('isFrozen')) { // SC.SelectionSet.EMPTY, for example
        temp = sel;
        sel = SC.SelectionSet.create();
        sel.beginPropertyChanges();
        sel.addObjects(temp);
        sel.addObject(obj);
        sel.endPropertyChanges();
        this.set('selection', sel);
      }
      else {
        sel.addObject(obj);
        this.notifyPropertyChange('listContent');
      }
    }
  },

  _removeSelectedObjects: function() {
    var listSelection = this.get('listSelection');
    var sel = this.get('selection');
    
    if (listSelection && sel) {
      sel.removeObjects(listSelection);
      this.notifyPropertyChange('listContent');
      this.set('listSelection', SC.SelectionSet.EMPTY);
    }
  }
  
});
