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

SCUI.DashboardColumnView = SC.ListView.extend( SCUI.DynamicCollection, {

  // PUBLIC PROPERTIES

  classNames: ['scui-dashboardcolumn-view'],
  
  exampleView: SCUI.WidgetView,
  canReorderContent: YES,
  isDropTarget: YES,
  
  /**
    Get the preferred insertion point for the given location, including 
    an insertion preference of before, after or on the named index.
    
    You can implement this method in a subclass if you like to perform a 
    more efficient check.  The default implementation will loop through the 
    item views looking for the first view to "switch sides" in the orientation 
    you specify.
    
    This method should return an array with two values.  The first value is
    the insertion point index and the second value is the drop operation,
    which should be one of SC.DROP_BEFORE, SC.DROP_AFTER, or SC.DROP_ON. 
    
    The preferred drop operation passed in should be used as a hint as to 
    the type of operation the view would prefer to receive. If the 
    dropOperation is SC.DROP_ON, then you should return a DROP_ON mode if 
    possible.  Otherwise, you should never return DROP_ON.
    
    For compatibility, you can also return just the insertion index.  If you
    do this, then the collction view will assume the drop operation is 
    SC.DROP_BEFORE.
    
    If an insertion is NOT allowed, you should return -1 as the insertion 
    point.  In this case, the drop operation will be ignored.
    
    @param loc {Point} the mouse location.
    @param dropOperation {DropOp} the preferred drop operation.
    @returns {Array} [proposed drop index, drop operation] 
  */
  insertionIndexForLocation: function(loc, dropOperation) { 
    var ret = 0 ;
    
    return [ret, SC.DROP_BEFORE];
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
        view, layer, height;
        
    if (len === 0) {
      height = 1; 
    } else {
      view = childViews.objectAt(len-1);
      layer = view ? view.get('layer') : null ;
      height = layer ? (layer.offsetTop + layer.offsetHeight) + 25: 1 ;
      layer = null ; // avoid memory leaks
    }
    
    // Adjust the height of the Dashboard
    var pv = this.get('parentView');
    var colIdx = this.get('columnIndex');
    pv.adjustColumnHeight(colIdx, height);
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
