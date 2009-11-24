// ==========================================================================
// SCUI.DashboardView
// ==========================================================================

sc_require('views/widget_missing');
sc_require('mixins/widget_overlay');
sc_require('mixins/dashboard_delegate');

/** @class

  This is an overridden SC.CollectionView as a container for dashboard widgets.

  @extends SC.CollectionView
  @author Jonathan Lewis
*/

SCUI.DashboardView = SC.CollectionView.extend( SCUI.DashboardDelegate, {

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
    A fallback item view that will only be used if the dashboard cannot
    fetch a custom widget view for a dashboard item.  It is just a basic
    view with an error message saying it can't find the correct widget view.
  */
  exampleView: SCUI.WidgetMissingView,

  /**
    The delegate responsible for handing out appropriate widget view classes for
    widgets in this dashboard.  Checks for delegates in this order:
      1. the 'delegate' property
      2. the 'content' property, in case the content is also a SCUI.DashboardDelegate
      3. this view itself
  */
  dashboardDelegate: function() {
    var del = this.get('delegate'), content = this.get('content');
    return this.delegateFor('isDashboardDelegate', del, content, this);
  }.property('delegate', 'content').cacheable(),

  // PUBLIC METHODS

  init: function() {
    var del;

    sc_super();
    
    del = this.get('dashboardDelegate');
    if (!del) {
      this.set('dashboardDelegate', this);
    }
  },

  /**
    Just API for now...
  */
  beginManaging: function() {
    // var childViews, len, view, i;
    // 
    // console.log('%@.beginManaging()'.fmt(this));
    // 
    // if (!this._isManaging) {
    //   this._isManaging = YES;
    // 
    //   childViews = this.get('childViews') || [];
    //   len = childViews.get('length');
    //   for (i = 0; i < len; i++) {
    //     view = childViews.objectAt(i);
    //     view.set('deleteHandleIsVisible', YES);
    //   }
    // }
  },
  
  /**
    Just API for now...
  */
  endManaging: function() {
    // var childViews, len, view, i;
    // 
    // console.log('%@.endManaging()'.fmt(this));
    // if (this._isManaging) {
    //   childViews = this.get('childViews') || [];
    //   len = childViews.get('length');
    //   for (i = 0; i < len; i++) {
    //     view = childViews.objectAt(i);
    //     view.set('deleteHandleIsVisible', NO);
    //   }
    //   
    //   this._isManaging = NO;
    // }
  },

  /**
    Returns the item view for the content object at the specified index. Call
    this method instead of accessing child views directly whenever you need 
    to get the view associated with a content index.

    Although this method take two parameters, you should almost always call
    it with just the content index.  The other two parameters are used 
    internally by the CollectionView.
    
    If you need to change the way the collection view manages item views
    you can override this method as well.  If you just want to change the
    default options used when creating item views, override createItemView()
    instead.
  
    Note that if you override this method, then be sure to implement this 
    method so that it uses a cache to return the same item view for a given
    index unless "force" is YES.  In that case, generate a new item view and
    replace the old item view in your cache with the new item view.
    
    Also, although "internal only," if called with "rebuild," the <em>caller</em> 
    is the one responsible for removing any old node from the parent node.

    @param {Number} idx the content index
    @param {Boolean} rebuild internal use only
    @returns {SC.View} instantiated view
  */
  itemViewForContentIndex: function(idx, rebuild) {
    // return from cache if possible
    var content   = this.get('content'),
        itemViews = this._sc_itemViews,
        item = content.objectAt(idx),
        del  = this.get('contentDelegate'),
        dashboardDelegate = this.get('dashboardDelegate'),
        groupIndexes = del.contentGroupIndexes(this, content),
        isGroupView = NO,
        key, ret, E, layout, layerId;

    // use cache if available
    if (!itemViews) itemViews = this._sc_itemViews = [] ;
    if (!rebuild && (ret = itemViews[idx])) return ret ; 
    
    // make sure to get rid of the cached one if we aren't using it
    if (itemViews[idx]) {
      itemViews[idx].destroy();
      delete itemViews[idx];
    }
    
    // otherwise generate...
    
    // first, determine the class to use
    isGroupView = groupIndexes && groupIndexes.contains(idx);

    // ask the delegate for the appropriate widget view
    if (dashboardDelegate) {
      E = dashboardDelegate.dashboardWidgetViewFor(this, content, idx);
    }

    // if it wasn't found, fall back on the standard example view
    if (!E) {
      if (isGroupView) isGroupView = del.contentIndexIsGroup(this, content,idx);
      if (isGroupView) {
        key  = this.get('contentGroupExampleViewKey');
        if (key && item) E = item.get(key);
        if (!E) E = this.get('groupExampleView') || this.get('exampleView');

      } else {
        key  = this.get('contentExampleViewKey');
        if (key && item) E = item.get(key);
        if (!E) E = this.get('exampleView');
      }
    }

    // collect some other state
    var attrs = this._TMP_ATTRS;
    attrs.contentIndex = idx;
    attrs.content      = item ;
    attrs.owner        = attrs.displayDelegate = this;
    attrs.parentView   = this.get('containerView') || this ;
    attrs.page         = this.page ;
    attrs.layerId      = this.layerIdFor(idx, item);
    attrs.isEnabled    = del.contentIndexIsEnabled(this, content, idx);
    attrs.isSelected   = del.contentIndexIsSelected(this, content, idx);
    attrs.outlineLevel = del.contentIndexOutlineLevel(this, content, idx);
    attrs.disclosureState = del.contentIndexDisclosureState(this, content, idx);
    attrs.isGroupView  = isGroupView;
    attrs.isVisibleInWindow = this.isVisibleInWindow;
    if (isGroupView) attrs.classNames = this._GROUP_COLLECTION_CLASS_NAMES;
    else attrs.classNames = this._COLLECTION_CLASS_NAMES;
    
    layout = this.layoutForContentIndex(idx);
    if (layout) {
      attrs.layout = layout;
    } else {
      delete attrs.layout ;
    }
    
    ret = this.createItemView(E, idx, attrs);
    itemViews[idx] = ret ;
    return ret ;
  },

  /**
    Calls the base CollectionView.createItemView() method first, then
    overrides the newly created itemView's layout.
  */
  createItemView: function(exampleClass, idx, attrs) {
    var itemView, content, frame, position, size;
    var finalLayout = { left: 20, top: 20, width: 400, height: 200 }; // default, will overwrite if possible

    console.log('%@.createItemView(%@)'.fmt(this, idx));

    attrs = SC.merge(attrs, SCUI.WidgetOverlay); // Mix in the widget overlay view additions    
    itemView = sc_super(); // call base method to create the view so we have valid frame info; we'll then override the layout

    if (itemView) {
      content = itemView.get('content');

      // width & height: first fetch from item if possible
      size = this._getItemSize(content); //  null if not found
      if (size) {
        finalLayout.width = size.width || 400;
        finalLayout.height = size.height || 200;
      }
      else {
        // width & height: if that didn't work, try using the itemView's frame size
        frame = itemView.get('frame');
        if (frame) {
          finalLayout.width = frame.width || 400;
          finalLayout.height = frame.height || 200;
        }
        else {
          console.warn('%@. ItemView %@ does not have a valid layout.'.fmt(this, idx));
        }
      }

      // position
      position = this._getItemPosition(content); // null if not found
      if (position) { // if we found a stored position, use it
        finalLayout.left = position.x;
        finalLayout.top = position.y;
      }
      else if (content) { // if it had no position, use a default, and save it on the dashboard element
        this._setItemPosition(content, { x: finalLayout.left, y: finalLayout.top });

        if (content.widgetDidMove) {
          content.widgetDidMove({ x: finalLayout.left, y: finalLayout.top });
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
    var content, frame;

    sc_super();

    // If this mouse up comes at the end of a drag of a widget
    // view, try to update the widget's model with new position
    if (this._dragData && this._dragData.didMove) {
      content = this._dragData.view.get('content');
      frame = this._dragData.view.get('frame');

      // try to update the widget data model with the new position
      if (content && frame) {
        this._setItemPosition(content, { x: frame.x, y: frame.y });
        
        if (content.widgetDidMove) {
          content.widgetDidMove({ x: frame.x, y: frame.y });
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
    var posKey;

    if (item) {
      posKey = item.get('positionKey') || 'position';
      item.set(posKey, pos);
    }
  },

  _getItemSize: function(item) {
    var sizeKey, size;
    
    if (item) {
      sizeKey = item.get('sizeKey') || 'size';
      size = item.get(sizeKey);
      if (size) {
        return { width: (parseFloat(size.width) || 0), height: (parseFloat(size.height) || 0) };
      }
    }

    return null;
  },

  // PRIVATE PROPERTIES
  
  _dragData: null, // data about the itemView currently being dragged; null when not dragging
  _isManaging: NO

});
