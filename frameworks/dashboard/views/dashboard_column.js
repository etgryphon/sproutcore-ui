// ==========================================================================
// SCUI.DashboardColumnView
// ==========================================================================
sc_require('core');
sc_require('views/widget');

/** @class

  @extends SC.View
  @author Evin Grano
  @version 0.1
*/

SCUI.DashboardColumnView = SC.CollectionView.extend({

  // PUBLIC PROPERTIES

  classNames: ['scui-dashboardcolumn-view'],
  
  exampleView: SCUI.WidgetView,
  canReorderContent: YES,
  isDropTarget: YES,
  
  /**
    @public: space between widgets
  */
  widgetSpacing: 10,
  widgetMargin: 5,
  
  // Internal height calculation...
  _currentHeight: null,
  
  init: function(){
    sc_super();
    this._currentHeight = [];
  },

  /**
    Overrides SC.CollectionView.createItemView().
    In addition to creating new view instance, it also overrides the layout
    to position the view according to size of all the other views...
  */
  createItemView: function(exampleClass, idx, attrs) {
    var margin = this.get('widgetMargin');
    var view = exampleClass.create(attrs); // create the new view
    var currHeight = view.get('currentHeight') + margin;
    var top = this._calculateTopPosition(idx);
    // override the layout so we can control positioning of this widget view
    var layout = { top: top, left: margin, right: margin, height: currHeight };
    view.set('layout', layout);
    this._currentHeight[idx] = currHeight;
    this._sc_itemViews[idx] = view;
    
    console.log('Widget View: %@ '.fmt(idx));
  
    return view;
  },
  
  _calculateTopPosition: function(idx){
    var total = 0;
    var spacing = this.get('widgetSpacing') || 0;
    var heightLen = this._currentHeight.length ;
    var len = idx < heightLen ? idx : heightLen ;
    for (var i = 0; i < len; i++){
      total += this._currentHeight[i] + spacing;
    }
    
    return spacing + total;
  },

  insertionIndexForLocation: function(loc, dropOperation) { 
    //console.log('\nDashboardColumnView: insertionIndexForLocation begin...');
    var len = this.get('length'), ret = 0, total = 0, height, midpoint;
    var spacing = this.get('widgetSpacing') || 0;
    var heights = this._currentHeight;
    for (var i = 0; i < len; i++){
      ret = i;
      height = heights[i];
      midpoint = total + (height/2);
      if (loc.y < midpoint) break;
      total += height + spacing;
    }
    //console.log('(%@): Insertion Index: %@'.fmt(this, ret));
    return ret;
  },
  
  /*******************************
  * Auto Height Adjustment...
  ********************************/
  
  /**
    Updates the height of the dahsboard view to reflect the current content of 
    the view.  This is called automatically whenever an item view is reloaded.
    You can also call this method directly if the height of one of your views
    has changed.
    
    The height will be recomputed based on the actual location and dimensions
    of the last child view.
    
    Note that normally this method will defer actually updating the height
    of the view until the end of the run loop.  You can force an immediate 
    update by passing YES to the "immediately" parameter.
    
    @param {Boolean} immediately YES to update immedately
    @returns {SC.StackedView} receiver
  */
  updateHeight: function(immediately) {
    if (immediately) this._updateHeight();
    else this.invokeLast(this._updateHeight);
    // ^ use invokeLast() here because we need to wait until all rendering has 
    //   completed.
    
    return this;
  },
  
  _updateHeight: function() {
    
    var childViews = this.get('childViews'),
        len        = childViews.get('length'),
        view, layer, height,
        margin = this.get('widgetMargin');
        
    if (len === 0) {
      height = 1; 
    } else {
      view = childViews.objectAt(len-1);
      layer = view ? view.get('layer') : null ;
      height = layer ? (layer.offsetTop + layer.offsetHeight + margin) : 1 ;
      layer = null ; // avoid memory leaks
    }
    
    // Adjust the height of the Dashboard
    var del = this.get('delegate');
    var colIdx = this.get('columnIndex');
    del.adjustColumnHeight(colIdx, height);
  },
  
  // ..........................................................
  // INTERNAL SUPPORT
  // 

  /** @private
    Whenever the collection view reloads some views, reset the cache on the
    frame as well so that it will recalculate.
  */
  didReload: function(set) { return this.updateHeight(); },

  /** @private
    When layer is first created, make sure we update the height using the 
    newly calculated value.
  */
  didCreateLayer: function() { return this.updateHeight(); }
  
});