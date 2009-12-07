// ==========================================================================
// SCUI.DashboardView
// ==========================================================================

sc_require('views/widget');

/** @class

  This is an overridden SC.CollectionView as a container for dashboard widgets.

  @extends SC.CollectionView
  @author Jonathan Lewis
*/

SCUI.DashboardView = SC.CollectionView.extend({

  // PUBLIC PROPERTIES
  
  classNames: ['scui-dashboard-view'],
  
  acceptsFirstResponder: YES,
  
  allowsEmptySelection: YES,
  allowsMultipleSelection: NO,
  
  /**
    Deletion of content via delete keys is not allowed as we have a special state to handle that.
  */
  canDeleteContent: NO,
  
  /**
    Don't change this.  This view is the base view for each widget and will contain
    the widget's custom views.  It handles the delete handle and config button overlays
    as well.
  */
  exampleView: SCUI.WidgetView,

  // PUBLIC METHODS

  beginManaging: function() {
    this.setIfChanged('canDeleteContent', YES);
  },
  
  endManaging: function() {
    this.setIfChanged('canDeleteContent', NO);
  },

  deleteWidget: function(widget) {
    var content = this.get('content');
    var i, sel;

    //console.log('%@.deleteWidget(%@)'.fmt(this, widget));

    if (widget) {
      i = content.indexOf(widget);
      if (i >= 0) {
        sel = SC.IndexSet.create(i, 1);
        this.select(sel);
        this.deleteSelection();
      }
    }
  },

  /**
    Calls the base CollectionView.createItemView() method first, then
    overrides the newly created itemView's layout.
  */
  createItemView: function(exampleClass, idx, attrs) {
    var itemView, content, frame, position, size;
    var finalLayout = { left: 0, top: 0, width: 400, height: 200 }; // default, will overwrite if possible
  
    itemView = sc_super(); // call base method to create the view so we have valid frame info; we'll then override the layout
    if (itemView) {
      content = itemView.get('content');

      // width & height: expect the WidgetView to have sized itself appropriately, so try to use that
      frame = itemView.get('frame');
      if (frame) {
        finalLayout.width = frame.width;
        finalLayout.height = frame.height;
      }
      else {
        console.warn('%@: WidgetView %@ does not have a valid layout.'.fmt(this, idx));
      }

      // position
      position = this._getItemPosition(content); // null if not found
      if (position) { // if we found a stored position, use it
        finalLayout.left = position.x;
        finalLayout.top = position.y;
      }
      else if (content && content.widgetProposedMove) { // if it had no position, use a default, and save it on the dashboard element
        position = content.widgetProposedMove({ x: finalLayout.left, y: finalLayout.top });
        if (position) { // the position might have been adjusted
          this._setItemPosition(content, position);
          finalLayout.left = position.x;
          finalLayout.top = position.y;
        }
      }

      // finally, override the layout with the standard style
      itemView.set('layout', finalLayout);
    }
  
    return itemView;
  },
  
  mouseDown: function(evt) {
    var itemView;

    sc_super();

    // Since a mouse down could be the start of a drag, save all
    // the data we'll need for it
    this._dragData = null;
    if (evt && evt.which === 1) { // left mouse button
      itemView = this.itemViewForEvent(evt);
      if (itemView && !itemView.getPath('content.isLocked')) { // only start dragging if widget isn't locked
        this._dragData = SC.clone(itemView.get('layout'));
        this._dragData.pageX = evt.pageX;
        this._dragData.pageY = evt.pageY;
        this._dragData.view = itemView;
        this._dragData.didMove = NO; // haven't moved yet
      }
    }
    
    return YES;
  },
  
  mouseUp: function(evt) {
    var content, frame, finalPos;

    sc_super();

    // If this mouse up comes at the end of a drag of a widget
    // view, try to update the widget's model with new position
    if (this._dragData && this._dragData.didMove) {
      content = this._dragData.view.get('content');
      frame = this._dragData.view.get('frame');

      // try to update the widget data model with the new position
      if (content && frame && content.widgetProposedMove) {
        finalPos = content.widgetProposedMove({ x: frame.x, y: frame.y });
        if (finalPos) {
          this._setItemPosition(content, finalPos);
          this._dragData.view.adjust({ left: finalPos.x, top: finalPos.y });
        }
        else {
          this._dragData.view.adjust({ left: this._dragData.left, top: this._dragData.top });
        }
      }
    }

    this._dragData = null; // clean up
    return YES;
  },
  
  mouseDragged: function(evt) {
    var d, dX, dY;

    sc_super();

    // We're in the middle of a drag, so adjust the view using the current drag delta
    if (this._dragData) {
      this._dragData.didMove = YES; // so that mouseUp knows whether to report the new position.
      
      d = this._dragData;
      dX = evt.pageX - d.pageX;
      dY = evt.pageY - d.pageY;

      this._adjustViewLayoutOnDrag(d.view, d.zoneX, d.zoneY, dX, d, 'left', 'right', 'centerX', 'width');
      this._adjustViewLayoutOnDrag(d.view, d.zoneY, d.zoneX, dY, d, 'top', 'bottom', 'centerY', 'height');
    }
    return YES;
  },
  
  // PRIVATE METHODS
  
  /**
    A utility method that adjust's the view's layout given a movement delta.
    It is smart about finding the view's own layout style and adjusting that.
  */
  _adjustViewLayoutOnDrag: function(view, curZone, altZone, delta, i, headKey, tailKey, centerKey, sizeKey) {
    // collect some useful values...
    var inAltZone = false; //(altZone === HEAD_ZONE) || (altZone === TAIL_ZONE);
    var head = i[headKey], tail = i[tailKey], center = i[centerKey], size = i[sizeKey];
    //this block determines what layout coordinates you have (top, left, centerX,centerY, right, bottom)
    //and adjust the view depented on the delta
    if (!inAltZone && !SC.none(size)) {
      if (!SC.none(head)) {
        view.adjust(headKey, head + delta);
      } else if (!SC.none(tail)) {
        view.adjust(tailKey, tail - delta) ;
      } else if (!SC.none(center)) {
        view.adjust(centerKey, center + delta);
      }
    }
  },
  
  /**
    Encapsulates the standard way the dashboard attempts to extract the last
    position from the dashboard element.
    Returns null if unsuccessful.
  */
  _getItemPosition: function(item) {
    var posKey, pos;

    if (item) {
      posKey = item.get('positionKey') || 'position';
      pos = item.get(posKey);
      if (pos) {
        return { x: (parseFloat(pos.x) || 0), y: (parseFloat(pos.y) || 0) };
      }
    }

    return null;
  },
  
  /**
    Encapsulates the standard way the dashboard attempts to store the last
    position on a dashboard element.
  */
  _setItemPosition: function(item, pos) {
    var posKey, finalPos;

    if (item) {
      posKey = item.get('positionKey') || 'position';
      item.set(posKey, pos);
    }
  },

  // PRIVATE PROPERTIES
  
  _dragData: null // data about the itemView currently being dragged; null when not dragging

});
