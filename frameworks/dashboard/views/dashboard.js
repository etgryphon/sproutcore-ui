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

SCUI.DashboardView = SC.View.extend( SC.CollectionViewDelegate, 
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
  
  /**
    Accept drops for data other than reordering.
    Set to true to allow of cross dashboard column inserting
    
    @type {Boolean}
  */
  isDropTarget: YES,
  
  /* @public: content param keys */
  exampleViewKey: 'exampleView',
  contentKey: 'content',
  widgetColumnKey: 'col',
  widgetColumnIndexKey: 'colIndex',
  widgetNameKey: 'name',
  widgetSizeKey: 'size',
  
  /* @private */
  _leftColumn: null,
  _rightColumn: null,
  _columnHeights: null,
  
  createChildViews: function(){
    var view, params, childViews = [];
    // Get the needed params
    var cWidth = this.get('columnWidth') || 400;
    var exampleWidgetView = this.get('exampleWidgetView') || SCUI.WidgetView ;
    
    // First, create the Left Column
    this._leftColumn = this.createChildView( SCUI.DashboardColumnView, {
      layout: {left: 0, top: 0, bottom: 0, width: cWidth},
      exampleView: exampleWidgetView,
      widgetMaxWidth: cWidth,
      delegate: this,
      columnIndex: 0
    });
    childViews.push(this._leftColumn);
    
    // First, create the Right Column
    this._rightColumn = this.createChildView( SCUI.DashboardColumnView, {
      layout: {right: 0, top: 0, bottom: 0, width: cWidth},
      exampleView: exampleWidgetView,
      widgetMaxWidth: cWidth,
      delegate: this,
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
    //debugger;
    console.log('Dashboard: Updating Widgets...');
    var c = this.get('content');
    if (c && c.length > 0) {
      
      var leftColWidgets = [];
      var rightColWidgets = [];
      
      // Get the dashboard off the content...
      var exViewKey = this.get('exampleViewKey');
      var contentKey = this.get('contentKey');
      
      // Widget Keys
      var colKey = this.get('widgetColumnKey');
      var colIdxKey = this.get('widgetColumnIndexKey');
      var nameKey = this.get('widgetNameKey');
      var sizeKey = this.get('widgetSizeKey');
      
      var currWidget, col, idx, content, exView;
      var currentIndex = 0;
      for(var i = 0, len = c.length; i < len; i++){
        currWidget = c[i];
        console.log('Formatting: Widget %@'.fmt(i));
        content = currWidget.get(contentKey) || SC.Object.create({});
        exView = currWidget.get(exViewKey) || SC.View;
        // Now grab the column and Column index
        col = content.get(colKey);
        idx = content.get(colIdxKey);
        
        // Do some default clean up in case we come across a widget that doesn't have a position
        if (idx === undefined) idx = currentIndex+1;
        if (!col && (idx > currentIndex)) {
          col = 0;
          currentIndex = idx;
        }
        
        if (col < 1){
          leftColWidgets[idx] = SC.Object.create({
            exampleView: exView,
            nameKey: nameKey,
            sizeKey: sizeKey,
            content: content
          });
        }
        else {
          rightColWidgets[idx] = SC.Object.create({
            exampleView: exView,
            nameKey: nameKey,
            sizeKey: sizeKey,
            content: content
          });
        }
      }
      
      // Compact the arrays
      leftColWidgets = this._compact(leftColWidgets);
      rightColWidgets = this._compact(rightColWidgets);
      
      this._leftColumn.set('content', leftColWidgets);
      this._rightColumn.set('content', rightColWidgets);
    }
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
  },
  
  adjustColumnHeight: function(columnIndex, newHeight){
    if (!this._columnHeights) this._columnHeights = [];
    if (columnIndex >= 0) this._columnHeights[columnIndex] = newHeight;
    
    var max = newHeight, curr;
    for (var i = 0, len = this._columnHeights.length; i < len; i++){
      curr = this._columnHeights[i];
      max = max < curr ? curr : max;
    }
    this.adjust('height', max);
  },
  
  /******************************************************************************************************************
    Collection View Delegate Code...
  *******************************************************************************************************************/
  
  /**
    Called by the collection view whenever the deleteSelection() method is
    called.  You can implement this method to get fine-grained control over
    which items can be deleted.  To prevent deletion, return null.
    
    This method is only called if canDeleteContent is YES on the collection
    view.
    
    @param {SC.CollectionView} view the collection view
    @param {SC.IndexSet} indexes proposed index set of items to delete.
    @returns {SC.IndexSet} index set allowed to delete or null.
  */
  collectionViewShouldDeleteIndexes: function(view, indexes) { 
    //console.log('DashboardView: collectionViewShouldDeleteIndexes');
    return indexes; 
  },
  
  // ..........................................................
  // DRAG SOURCE SUPPORT
  //
  
  /**
    Called by the collection view just before it starts a drag to give you
    an opportunity to decide if the drag should be allowed. 
    
    You can use this method to implement fine-grained control over when a 
    drag will be allowed and when it will not be allowed.  For example, you
    may enable content reordering but then implement this method to prevent
    reordering of certain items in the view.
    
    The default implementation always returns YES.
    
    @param view {SC.CollectionView} the collection view
    @returns {Boolean} YES to alow, NO to prevent it
  */
  collectionViewShouldBeginDrag: function(view) { 
    var sel = view.get('selection');
    var isLocked = NO;
    if (sel){
      // find only the indexes that are in both dragContent and nowShowing.
      // TODO: [EG] Add the call to the 
      var indexes = sel.indexSetForSource(view.get('content'));
      var first = indexes.firstObject();
      var widgetView = view.itemViewForContentIndex(first);
      isLocked = widgetView.get('isLocked');
    }
    return !isLocked;
  },
  
  /**
    Returns a the SCUI.WIDGET_TYPE for dragging between Dashboard Columns
    
    @param view {SC.CollectionView} the collection view to begin dragging.
    @returns {Array} array of supported data types.
  */
  collectionViewDragDataTypes: function(view) { 
    return [SCUI.WIDGET_TYPE]; 
  },
  
  /**
    Called by a collection view when a drag concludes to give you the option
    to provide the drag data for the drop.
    
    This method should be implemented essentially as you would implement the
    dragDataForType() if you were a drag data source.  You will never be asked
    to provide drag data for a reorder event, only for other types of data.
    
    The default implementation returns null.
    
    @param view {SC.CollectionView} 
      the collection view that initiated the drag

    @param dataType {String} the data type to provide
    @param drag {SC.Drag} the drag object
    @returns {Object} the data object or null if the data could not be provided.
  */
  collectionViewDragDataForType: function(view, drag, dataType) {  
    var ret=null, sel;
    
    if (dataType === SCUI.WIDGET_TYPE) {
      sel = view.get('selection');
      ret = [];
      if (sel) sel.forEach(function(x) { ret.push(x); }, this);
    }
    
    return ret ;
  },
  
  // ..........................................................
  // DROP TARGET SUPPORT
  //
  
  /**
    Called once during a drag the first time view is entered. Return all 
    possible drag operations OR'd together.
    
    @param {SC.CollectionView} view
      the collection view that initiated the drag

    @param {SC.Drag} drag
      the drag object
    
    @param {Number} proposedDragOperations
      proposed logical OR of allowed drag operations.

    @returns {Number} the allowed drag operations. Defaults to op
  */
  collectionViewComputeDragOperations: function(view, drag, proposedDragOperations) {
    if (drag.hasDataType(SCUI.WIDGET_TYPE)) {
      var source = drag.get('source');
      if (source && source.delegate === this) return SC.DRAG_MOVE;
    }
    
    return SC.DRAG_NONE;
  },
  
  /**
    Called by the collection view to actually accept a drop.  This method will
    only be invoked AFTER your validateDrop method has been called to
    determine if you want to even allow the drag operation to go through.
    
    You should actually make changes to the data model if needed here and
    then return the actual drag operation that was performed.  If you return
    SC.DRAG_NONE and the dragOperation was SC.DRAG_REORDER, then the default
    reorder behavior will be provided by the collection view.
    
    @param view {SC.CollectionView}
    @param drag {SC.Drag} the current drag object
    @param op {Number} proposed logical OR of allowed drag operations.
    @param proposedInsertionIndex {Number} an index into the content array representing the proposed insertion point.
    @param proposedDropOperation {String} the proposed drop operation.  Will be one of SC.DROP_ON, SC.DROP_BEFORE, or SC.DROP_ANY.
    @returns the allowed drag operation.  Defaults to proposedDragOperation
  */
  collectionViewPerformDragOperation: function(view, drag, dragOp, proposedInsertionIndex, proposedDropOperaration) {

    if (dragOp & SC.DRAG_REORDER){
      // TODO: [EG] Add the callback to the model to update the position
      console.log('Dashboard: Reorder to Index: %@...'.fmt(proposedInsertionIndex));
      return SC.DRAG_NONE; // allow reorder
    }
    
    var widgets = drag.dataForType(SCUI.WIDGET_TYPE),
        content   = view.get('content'),
        len       = view.get('length'),
        source    = drag.get('source'),
        ret       = SC.DRAG_NONE;
    
    // only if data is available from drag
    if (!widgets) return ret;
    
    // adjust the index to the location to insert and then add it
    if (proposedDropOperaration & SC.DROP_AFTER) proposedInsertionIndex--;
    if (proposedInsertionIndex>len) proposedInsertionIndex = len;
    content.replace(proposedInsertionIndex, 0, widgets);
    
    // if we can move, then remove employees from the old one
    if ( (dragOp & SC.DRAG_MOVE) && (content = source.get('content')) ) {
      content.removeObjects(widgets);
      ret = SC.DRAG_MOVE;
    }       
    
    // finally, select the new widgets
    view.select(SC.IndexSet.create(proposedInsertionIndex, widgets.get('length')));
    view.becomeFirstResponder();
    
    return ret;
  },
  
  /**
    Renders a drag view for the passed content indexes. If you return null
    from this, then a default drag view will be generated for you.
    
    @param {SC.CollectionView} view
    @param {SC.IndexSet} dragContent
    @returns {SC.View} view or null
  */
  collectionViewDragViewFor: function(view, dragContent) {
     // find only the indexes that are in both dragContent and nowShowing.
     var indexes = view.get('nowShowing').without(dragContent);
     indexes = view.get('nowShowing').without(indexes);
     
     var first = indexes.firstObject();
     var itemGhostView = view.itemViewForContentIndex(first);
     
     return itemGhostView;
  }
  
});