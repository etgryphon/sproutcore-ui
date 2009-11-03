// ==========================================================================
// SCUI.DashboardView
// ==========================================================================
sc_require('core');
sc_require('views/dashboard_column');

/** @class

  This is a management view that handles multiple StackViews for dashboard like architecture

  @extends SC.View
  @author Evin Grano
  @version 0.1
  @since 0.1
*/

SCUI.DashboardView = SC.View.extend(
/** @scope SCUI.DashboardView.prototype */ {
  
  classNames: ['scui-dashboard-view'],
  
  /* @public: general params */
  /* @array: 
    {
      exampleView: SC.View,
      content: {
        col: 0,
        colIndex: 1,
        name: 'name',
        *size: {width: 100, height: 100} <= Optional, if your model controls the size of the widget
      }
    }
  */
  content: null,
  columnWidth: 400,
  exampleWidgetView: SCUI.WidgetView,
  delegate: null,
  
  /**
    Accept drops for data other than reordering.
    Set to true to allow of cross dashboard column inserting
    
    @type {Boolean}
  */
  isDropTarget: YES,
  
  /* @public: content param keys */
  columnKey: 'col',
  columnIndexKey: 'colIndex',
  
  /* @private */
  _leftColumn: null,
  _rightColumn: null,
  _columnHeights: null,
  
  createChildViews: function(){
    var view, params, childViews = [];
    // Get the needed params
    var cWidth = this.get('columnWidth') || 400;
    var exampleWidgetView = this.get('exampleWidgetView') || SCUI.WidgetView ;
    var delegate = this.get('delegate');
    
    // First, create the Left Column
    this._leftColumn = this.createChildView( SCUI.DashboardColumnView, {
      layout: {left: 0, top: 0, bottom: 0, width: cWidth},
      exampleView: exampleWidgetView,
      widgetMaxWidth: cWidth,
      rowSpacing: 10,
      rowMargin: 5,
      delegate: delegate,
      columnIndex: 0
    });
    childViews.push(this._leftColumn);
    
    // First, create the Right Column
    this._rightColumn = this.createChildView( SCUI.DashboardColumnView, {
      layout: {right: 0, top: 0, bottom: 0, width: cWidth},
      exampleView: exampleWidgetView,
      rowSpacing: 10,
      rowMargin: 5,
      widgetMaxWidth: cWidth,
      delegate: delegate,
      columnIndex: 1
    });
    childViews.push(this._rightColumn);
    
    this.set('childViews', childViews);
  },
  
  didCreateLayer: function(){
    this._updateWidgets();
  },
  
  contentDidChange: function(){
    this._updateWidgets();
  }.observes('content'),
  
  _updateWidgets: function(){
    console.log('Dashboard: Updating Widgets...');
    var c = this.get('content');
    if (c && c.length > 0) {
      
      var leftColWidgets = [];
      var rightColWidgets = [];
      
      // Widget Keys
      var colKey = this.get('columnKey');
      var colIdxKey = this.get('columnIndexKey');
            
      var currWidget, col, idx;
      var currentIndex = 0;
      for(var i = 0, len = c.length; i < len; i++){
        currWidget = c[i];
        // Now grab the column and Column index
        col = currWidget.get(colKey);
        idx = currWidget.get(colIdxKey);
        
        // Do some default clean up in case we come across a widget that doesn't have a position
        if (idx === undefined) idx = currentIndex+1;
        if (!col && (idx > currentIndex)) {
          col = 0;
          currentIndex = idx;
        }
        
        if (col < 1){
          leftColWidgets[idx] = currWidget;
        }
        else {
          rightColWidgets[idx] = currWidget;
        }
      }
      
      // Compact the arrays
      leftColWidgets = this._compact(leftColWidgets);
      rightColWidgets = this._compact(rightColWidgets);
      
      this._leftColumn.set('content', leftColWidgets);
      this._rightColumn.set('content', rightColWidgets);
    }
  },
  
  adjustColumnHeight: function(columnIndex, newHeight){
    //console.log('SCUI.DashboardView: adjustColumnHeight with %@'.fmt(newHeight));
    if (!this._columnHeights) this._columnHeights = [];
    if (columnIndex >= 0) this._columnHeights[columnIndex] = newHeight;
    
    var max = newHeight, curr;
    for (var i = 0, len = this._columnHeights.length; i < len; i++){
      curr = this._columnHeights[i];
      max = max < curr ? curr : max;
    }
    this.adjust('height', max);
  },
  
  /****************************************************
  * @private
  * Function for getting rid of all non-valid objects
  ****************************************************/
  _compact: function(arrayToCompact){
    var compacted = [];
    if(!arrayToCompact) return arrayToCompact;
    var curr;
    for( var i = 0, len = arrayToCompact.length; i < len; i++){
      curr = arrayToCompact[i];
      if(curr) compacted.push(curr);
    }
    
    return compacted;
  }
    
});
