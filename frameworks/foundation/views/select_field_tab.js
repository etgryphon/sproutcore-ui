// ==========================================================================
// Project:   SCUI.SelectFieldTab 
// ==========================================================================
/*globals SCUI */

/** @class

  this view acts just like tab view but instead of a segmented button
  uses a select field view to switch views....

  
  @extends SC.View
*/

SCUI.SelectFieldTab = SC.View.extend(
/** @scope SCUI.SelectFieldTab.prototype */ {
  
  classNames: ['scui-select-field-tab-view'],
  
  displayProperties: ['nowShowing'],

  // ..........................................................
  // PROPERTIES
  // 

  nowShowing: null,

  items: [],

  isEnabled: YES,

  itemTitleKey: null,
  itemValueKey: null,
  itemIsEnabledKey: null,
  itemIconKey: null,
  itemWidthKey: null,
  itemToolTipKey: null,

  // ..........................................................
  // FORWARDING PROPERTIES
  // 

  // forward important changes on to child views
  _tab_nowShowingDidChange: function() {
    var v = this.get('nowShowing');
    this.get('containerView').set('nowShowing',v);
    this.get('selectFieldView').set('value',v);
    return this ;
  }.observes('nowShowing'),

  _tab_itemsDidChange: function() {
    this.get('selectFieldView').set('items', this.get('items'));
    return this ;    
  }.observes('items'),

  _isEnabledDidChange: function() {
    var isEnabled = this.get('isEnabled');

    if (this.containerView && this.containerView.set) {
      this.containerView.set('isEnabled', isEnabled);
    }
    
    if (this.selectFieldView && this.selectFieldView.set) {
      this.selectFieldView.set('isEnabled', isEnabled);
    }
  }.observes('isEnabled'),

  /** @private
    Restore userDefault key if set.
  */
  init: function() {
    sc_super();
    this._tab_nowShowingDidChange()._tab_itemsDidChange();

    // propagate classNames to the selectFieldView (e.g., 'dark')
    var classNames = this.get('classNames'), sfClassNames = this.selectFieldView.get('classNames');
    classNames = classNames.without('sc-view').without('scui-select-field-tab-view');
    sfClassNames = sfClassNames.uniq();
    sfClassNames.pushObjects(classNames);
    this.selectFieldView.set('classNames', sfClassNames);
  },

  createChildViews: function() {
    var childViews = [], view, ContainerView ;
    var isEnabled = this.get('isEnabled');

    ContainerView = this.containerView.extend({
      layout: { top:24, left:0, right:0, bottom: 0 }
    });

    view = this.containerView = this.createChildView(ContainerView, { isEnabled: isEnabled }) ;
    childViews.push(view);

    view = this.selectFieldView = this.createChildView(this.selectFieldView, { isEnabled: isEnabled }) ;
    childViews.push(view);

    this.set('childViews', childViews);
    return this; 
  },

  // ..........................................................
  // COMPONENT VIEWS
  // 

  /**
    The containerView managed by this tab view.  Note that TabView uses a 
    custom container view.  You can access this view but you cannot change 
    it.
  */
  containerView: SC.ContainerView,

  /**
    The selectFieldView managed by this tab view.  Note that this TabView uses
    a custom segmented view.  You can access this view but you cannot change
    it.
    
    --Updated this to a selectButton view to remove the select element. [jcd]
  */
  selectFieldView: SC.SelectButtonView.extend({
    layout: { left: 4, right: 0, height: 24 },
    //litte items => objects alias so I can use the same properties as a tab view...
    items: function(key, value){
      if(value === undefined){
        return this.get('objects');
      }
      else{
        return this.set('objects', value);
      }
    }.property('objects').cacheable(),
    
    itemTitleKey: function(key, value){
      if(value === undefined){
        return this.get('nameKey');
      }
      else{
        return this.set('nameKey', value);
      }
    }.property('nameKey').cacheable(),

    itemValueKey: function(key, value){
      if(value === undefined){
        return this.get('valueKey');
      }
      else{
        return this.set('valueKey', value);
      }
    }.property('valueKey').cacheable(),

    /** @private
      When the value changes, update the parentView's value as well.
    */
    _scui_select_field_valueDidChange: function() {
      var pv = this.get('parentView');
      if (pv) pv.set('nowShowing', this.get('value'));
      this.set('layerNeedsUpdate', YES) ;
      this.invokeOnce(this.updateLayerIfNeeded) ;
    }.observes('value'),

    init: function() {
      // before we setup the rest of the view, copy key config properties 
      // from the owner view...
      var pv = this.get('parentView');
      if (pv) {
        SC._TAB_ITEM_KEYS.forEach(function(k) { this[SCUI._SELECT_TAB_TRANSLATOR[k]] = pv.get(k); }, this);
      }
      return sc_super();
    }
  })
});

SCUI._SELECT_TAB_TRANSLATOR = {itemTitleKey: 'nameKey', itemValueKey: 'valueKey', items: 'objects'};

