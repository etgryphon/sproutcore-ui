// ==========================================================================
// SCUI.DashboardView
// ==========================================================================

sc_require('views/widget_container');
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
    Don't change this.  This view is the base view for each widget and will contain
    the widget's custom views.  It handles the delete handle and config button overlays
    as well.
  */
  exampleView: SCUI.WidgetContainerView,

  dashboardDelegate: function() {
    var del = this.get('delegate'), content = this.get('content');
    return this.delegateFor('isDashboardDelegate', del, content, this);  
  }.property('delegate', 'content').cacheable(),

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
        groupIndexes = del.contentGroupIndexes(this, content),
        isGroupView = NO,
        key, ret, E, layout, layerId,
        dashboardDelegate, widgetViewClass, widgetEditViewClass;

    // use cache if available
    if (!itemViews) itemViews = this._sc_itemViews = [] ;
    if (!rebuild && (ret = itemViews[idx])) return ret ; 

    // otherwise generate...

    // First ask the item itself, then the dashboard delegate
    dashboardDelegate = this.get('dashboardDelegate'); // defaults to this
    widgetViewClass = dashboardDelegate.dashboardWidgetViewFor(this, content, idx, item) || item.get(item.get('widgetViewClassKey'));
    widgetEditViewClass = dashboardDelegate.dashboardWidgetEditViewFor(this, content, idx, item) || item.get(item.get('widgetEditViewClassKey'));
    
    // first, determine the class to use
    isGroupView = groupIndexes && groupIndexes.contains(idx);
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

    // collect some other state
    var attrs = this._TMP_ATTRS;
    attrs.widgetViewClass     = widgetViewClass; // tell the widget container what views to use as content
    attrs.widgetEditViewClass = widgetEditViewClass;
    attrs.canDeleteWidget     = this.get('canDeleteContent');
    attrs.contentIndex        = idx;
    attrs.content             = item ;
    attrs.owner               = attrs.displayDelegate = this;
    attrs.parentView          = this.get('containerView') || this ;
    attrs.page                = this.page ;
    attrs.layerId             = this.layerIdFor(idx, item);
    attrs.isEnabled           = del.contentIndexIsEnabled(this, content, idx);
    attrs.isSelected          = del.contentIndexIsSelected(this, content, idx);
    attrs.outlineLevel        = del.contentIndexOutlineLevel(this, content, idx);
    attrs.disclosureState     = del.contentIndexDisclosureState(this, content, idx);
    attrs.isGroupView         = isGroupView;
    attrs.isVisibleInWindow   = this.isVisibleInWindow;
    if (isGroupView) {
      attrs.classNames = this._GROUP_COLLECTION_CLASS_NAMES;
    }
    else {
      attrs.classNames = this._COLLECTION_CLASS_NAMES;
    }

    layout = this.layoutForContentIndex(idx);
    if (layout) {
      attrs.layout = layout;
    }
    else {
      delete attrs.layout ;
    }
    
    ret = this.createItemView(E, idx, attrs);
    itemViews[idx] = ret ;
    return ret ;
  },

  layoutForContentIndex: function(contentIndex) {
    var content = this.get('content');
    var item = content ? content.objectAt(contentIndex) : null;
    var layout = null;
    var pos, size;
    
    if (item) {
      pos = this._getItemPosition(item) || { x: 20, y: 20 };
      size = this._getItemSize(item) || { width: 300, height: 100 };
      layout = { left: pos.x, top: pos.y, width: size.width, height: size.height };
    }
    return layout;
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
        this._dragData.startPageX = evt.pageX;
        this._dragData.startPageY = evt.pageY;
        this._dragData.view = itemView;
        this._dragData.didMove = NO; // haven't moved yet
      }
    }
    
    return YES;
  },
  
  mouseDragged: function(evt) {
    var dX, dY;

    sc_super();

    // We're in the middle of a drag, so adjust the view using the current drag delta
    if (this._dragData) {
      this._dragData.didMove = YES; // so that mouseUp knows whether to report the new position.
      
      dX = evt.pageX - this._dragData.startPageX;
      dY = evt.pageY - this._dragData.startPageY;
      this._dragData.view.adjust({ left: this._dragData.left + dX, top: this._dragData.top + dY });
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
      if (content && frame) {
        finalPos = { x: frame.x, y: frame.y };
        this._setItemPosition(content, finalPos);
      }
    }

    this._dragData = null; // clean up
    return YES;
  },
  
  // PRIVATE METHODS
  
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
      sizeKey = item.get('sizeKey');
      size = sizeKey ? item.get(sizeKey) : null;
      if (size) {
        return { width: (parseFloat(size.width) || 0), height: (parseFloat(size.height) || 0) };
      }
    }
    
    return null;
  },
  
  _setItemSize: function(item, size) {
    var sizeKey;
    
    if (item) {
      sizeKey = item.get('sizeKey');
      if (sizeKey) {
        item.set(sizeKey, size);
      }
    }
  },

  _canDeleteContentDidChange: function() {
    var canDelete = this.get('canDeleteContent');
    var itemViews = this._sc_itemViews || [];
    itemViews.forEach(function(v) {
      v.setIfChanged('canDeleteWidget', canDelete);
    });
  }.observes('canDeleteContent'),

  // PRIVATE PROPERTIES
  
  _dragData: null // data about the itemView currently being dragged; null when not dragging

});
