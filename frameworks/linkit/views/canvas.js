// ==========================================================================
// LinkIt.CanvasView
// ==========================================================================

/** @class

  This is the canvas tag that draws the line on the screen

  @extends SC.View
  @author Jonathan Lewis
  @author Evin Grano
  @author Mohammed Taher
  @version 0.1
*/

LinkIt.CanvasView = SC.CollectionView.extend({

  // PUBLIC PROPERTIES

  classNames: ['linkit-canvas'],

  /**
    YES if there are no nodes present on the canvas.  Provided so you can style
    the canvas differently when empty if you want to.
  */
  isEmpty: YES,
  
  /**
    SC.CollectionView property that lets delete keys be detected
  */
  acceptsFirstResponder: YES,

  /**
  */
  canDeleteContent: YES,

  /**
    SC.CollectionView property that allows clearing the selection by clicking
    in an empty area.
  */
  allowDeselectAll: YES,

  /**
  */
  nodeViewDelegate: null,
  
  /**
    How close you have to click to a line before it is considered a hit
  */
  LINK_SELECTION_FREEDOM: 6,
  
  /**
    Pointer to selected link object
  */
  linkSelection: null,
  
  /**
  */
  displayProperties: ['frame', '_links.[]'],
  
  // PUBLIC METHODS

  /**
    Call this to trigger a links refresh
  */
  linksDidChange: function() {
    //console.log('%@.linksDidChange()'.fmt(this));
    this.invokeOnce(this._updateLinks);
  },

  render: function(context, firstTime) {
    //console.log('%@.render()'.fmt(this));
    var frame = this.get('frame');
    if (firstTime) {
      if (!SC.browser.msie) {
        context.push('<canvas class="base-layer" width="%@" height="%@">You can\'t use canvas tags</canvas>'.fmt(frame.width, frame.height));
      }
    }
    else {
      var canvasElem = this.$('canvas.base-layer');
      if (canvasElem) {
        canvasElem.attr('width', frame.width);
        canvasElem.attr('height', frame.height);
        if (canvasElem.length > 0) {
          var cntx = canvasElem[0].getContext('2d'); // Get the actual canvas object context
          if (cntx) {
            cntx.clearRect(0, 0, frame.width, frame.height);
            this._drawLinks(cntx);
          }
          else {
            LinkIt.log("Linkit.LayerView.render(): Canvas object context is not accessible.");
          }
        }
        else {
          LinkIt.log("Linkit.LayerView.render(): Canvas element array length is zero.");
        }
      }
      else {
        LinkIt.log("Linkit.LayerView.render(): Canvas element is not accessible.");
      }
    }
    
    return sc_super();
  },
  
  /*
  [MT] - DON'T REMOVE COMMENTED OUT BLOCK... Commenting this out since 
  we're supporting IE through Google Chrome Frame. Might change this down the road.
  
  didCreateLayer: function() {
    sc_super();
    if (SC.browser.msie) {
      var frame = this.get('frame');
      var canvas = document.createElement('CANVAS');
      canvas.className = 'base-layer';
      canvas.width = frame.width;
      canvas.height = frame.height;
      this.$().append(canvas);
      canvas = G_vmlCanvasManager.initElement(canvas);
      this._canvasie = canvas;
    }
  },
  */

  /** 
    Invoked once per runloop to actually reload any needed item views.
    You can call this method at any time to actually force the reload to
    happen immediately if any item views need to be reloaded.
    
    Note that this method will also invoke two other callback methods if you
    define them on your subclass:
    
    - *willReload()* is called just before the items are reloaded
    - *didReload()* is called jsut after items are reloaded
    
    You can use these two methods to setup and teardown caching, which may
    reduce overall cost of a reload.  Each method will be passed an index set
    of items that are reloaded or null if all items are reloaded.
    
    @returns {SC.CollectionView} receiver
  */
  reloadIfNeeded: function() {
    var invalid = this._invalidIndexes;
    if (!invalid || !this.get('isVisibleInWindow')) return this ; // delay
    this._invalidIndexes = NO ;
    
    var content = this.get('content'),
        len     = content ? content.get('length'): 0,
        layout  = this.computeLayout(),
        bench   = SC.BENCHMARK_RELOAD,
        nowShowing = this.get('nowShowing'),
        itemViews  = this._sc_itemViews,
        containerView = this.get('containerView') || this,
        views, idx, cvlen, view, childViews, layer ;

    // if the set is defined but it contains the entire nowShowing range, just
    // replace
    if (invalid.isIndexSet && invalid.contains(nowShowing)) invalid = YES ;
    if (this.willReload) this.willReload(invalid === YES ? null : invalid);

    // if an index set, just update indexes
    if (invalid.isIndexSet) {
      childViews = containerView.get('childViews');
      cvlen = childViews.get('length');
      
      if (bench) {
        SC.Benchmark.start(bench="%@#reloadIfNeeded (Partial)".fmt(this),YES);
      }
      
      invalid.forEach(function(idx) {
        
        // get the existing item view, if there is one
        var existing = itemViews ? itemViews[idx] : null;
        
        // if nowShowing, then reload the item view.
        if (nowShowing.contains(idx)) {
          view = this.itemViewForContentIndex(idx, YES);
          if (existing && existing.parentView === containerView) {
    
            // if the existing view has a layer, remove it immediately from
            // the parent.  This is necessary because the old and new views 
            // will use the same layerId
            layer = existing.get('layer');
            if (layer && layer.parentNode) {
              layer.parentNode.removeChild(layer);  
            } 
            layer = null ; // avoid leaks
            
            containerView.replaceChild(view, existing);
          } else {
            containerView.appendChild(view);
          }
          
        // if not nowShowing, then remove the item view if needed
        } else if (existing && existing.parentView === containerView) {
          delete itemViews[idx];
          containerView.removeChild(existing);
        }
      },this);

      if (bench) SC.Benchmark.end(bench);
      
    // if set is NOT defined, replace entire content with nowShowing
    } else {

      if (bench) {
        SC.Benchmark.start(bench="%@#reloadIfNeeded (Full)".fmt(this),YES);
      }

      // truncate cached item views since they will all be removed from the
      // container anyway.
      if (itemViews) itemViews.length = 0 ; 
      
      views = [];
      nowShowing.forEach(function(idx) {
        views.push(this.itemViewForContentIndex(idx, YES));
      }, this);
      
      // [JL] Changed this to use replaceAllChildren() so that notifications
      // about old child views being removed would fire like normal and everything would be cleaned up.
      containerView.replaceAllChildren(views);
      
      if (bench) SC.Benchmark.end(bench);
      
    }
    
    // adjust my own layout if computed
    if (layout) this.adjust(layout);
    if (this.didReload) this.didReload(invalid === YES ? null : invalid);
    
    
    return this ;
  },
  
  didReload: function(invalid) {
    //console.log('%@.didReload()'.fmt(this));
    var viewIndex = {};
    var content = this.get('content') || [];
    var len = content.get('length');
    var node, nodeID, view;
    for (var i = 0; i < len; i++) {
      node = content.objectAt(i);
      nodeID = SC.guidFor(node);
      view = this.itemViewForContentIndex(i);
      viewIndex[nodeID] = view;
    }
    this._nodeViewIndex = viewIndex;
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
    //console.log('%@.itemViewForContentIndex(%@, %@)'.fmt(this, idx, rebuild));
    // return from cache if possible
    var content   = this.get('content'),
        itemViews = this._sc_itemViews,
        item = content.objectAt(idx),
        del  = this.get('contentDelegate'),
        groupIndexes = del.contentGroupIndexes(this, content),
        isGroupView = NO,
        key, ret, E, layout, layerId,
        nodeViewDelegate;

    // use cache if available
    if (!itemViews) itemViews = this._sc_itemViews = [] ;
    if (!rebuild && (ret = itemViews[idx])) return ret ; 

    // otherwise generate...
    
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

      // Ask the example view delegate if there is one
      if (!E && (nodeViewDelegate = this.get('nodeViewDelegate'))) {
        E = nodeViewDelegate.exampleViewForNode(item);
      }
  
      if (!E) E = this.get('exampleView');
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
    Overrides SC.CollectionView.createItemView().
    In addition to creating new view instance, it also overrides the layout
    to position the view according to where the LinkIt.Node API indicates, or
    randomly generated position if that's not present.
  */
  createItemView: function(exampleClass, idx, attrs) {
    var view, frame;
    var layout, position;
    var node = attrs.content;

    if (exampleClass) {
      view = exampleClass.create(attrs);
    }
    else { // if no node view, create a default view with an error message in it
      view = SC.LabelView.create(attrs, {
        layout: { left: 0, top: 0, width: 150, height: 50 },
        value: 'Missing NodeView'
      });
    }

    frame = view.get('frame');
    position = this._getItemPosition(node);

    // generate a random position if it's not present
    if (!position) {
      position = this._genRandomPosition();
      this._setItemPosition(node, position);
    }
    
    // override the layout so we can control positioning of this node view
    layout = { top: position.y, left: position.x, width: frame.width, height: frame.height };
    view.set('layout', layout);
    return view;
  },

  /**
    Override this method from SC.CollectionView to handle link deletion.
    Handles regular item deletion by calling sc_super() first.
  */
  deleteSelection: function() {
    var ret = sc_super();
    this.deleteLinkSelection();
    
    // Always return YES since this becomes the return value of the keyDown() method
    // in SC.CollectionView and we have to signal we are absorbing backspace keys whether
    // we delete anything or not, or the browser will treat it like the Back button.
    return YES;
  },

  /**
    Attempts to delete the link selection if present and possible
  */
  deleteLinkSelection: function() {
    var link = this.get('linkSelection');
    if (link) {
      var startNode = link.get('startNode');
      var endNode = link.get('endNode');
      if (startNode && endNode) {
        if (startNode.canDeleteLink(link) && endNode.canDeleteLink(link)) {
          startNode.deleteLink(link);
          endNode.deleteLink(link);
          this.set('linkSelection', null);
          this.displayDidChange();
        }
      }
    }
  },

  mouseDown: function(evt) {
    var pv, frame, globalFrame, canvasX, canvasY, itemView, menuPane, menuOptions;
    var linkSelection;

    sc_super();

    // init the drag data
    this._dragData = null;

    if (evt && (evt.which === 3) || (evt.ctrlKey && evt.which === 1)) {
      linkSelection = this.get('linkSelection');
      if (linkSelection && !this.getPath('selection.length')) {
        menuOptions = [
          { title: "Delete Selected Link".loc(), target: this, action: 'deleteLinkSelection', isEnabled: YES }
        ];

        menuPane = SCUI.ContextMenuPane.create({
          contentView: SC.View.design({}),
          layout: { width: 194, height: 0 },
          itemTitleKey: 'title',
          itemTargetKey: 'target',
          itemActionKey: 'action',
          itemSeparatorKey: 'isSeparator',
          itemIsEnabledKey: 'isEnabled',
          items: menuOptions
        });
        
        menuPane.popup(this, evt);
      }
    }
    else {
      pv = this.get('parentView');
      frame = this.get('frame');
      globalFrame = pv ? pv.convertFrameToView(frame, null) : frame;
      canvasX = evt.pageX - globalFrame.x;
      canvasY = evt.pageY - globalFrame.y;
      this._selectLink( {x: canvasX, y: canvasY} );

      itemView = this.itemViewForEvent(evt);
      if (itemView) {
        this._dragData = SC.clone(itemView.get('layout'));
        this._dragData.startPageX = evt.pageX;
        this._dragData.startPageY = evt.pageY;
        this._dragData.view = itemView;
        this._dragData.didMove = NO; // hasn't moved yet; drag will update this
      }
    }
    
    return YES;
  }, 

  mouseDragged: function(evt) {
    var dX, dY;

    if (this._dragData) {
      this._dragData.didMove = YES; // so that mouseUp knows whether to report the new position.
      dX = evt.pageX - this._dragData.startPageX;
      dY = evt.pageY - this._dragData.startPageY;
      this._dragData.view.adjust({ left: this._dragData.left + dX, top: this._dragData.top + dY });
      
      this.displayDidChange(); // so that links get redrawn
    }
    return YES;
  },

  /**
  */
  mouseUp: function(evt) {
    var ret = sc_super();
    var layout, content, newPosition;
    
    if (this._dragData && this._dragData.didMove) {
      layout = this._dragData.view.get('layout');
      content = this._dragData.view.get('content');

      if (content && content.get('isNode')) {
        newPosition = { x: layout.left, y: layout.top };
        this._setItemPosition(content, newPosition);
      }
    }
    
    this._dragData = null; // clean up
    return ret;
  },

  // PRIVATE METHODS
  
  _layoutForNodeView: function(nodeView, node) {
    var layout = null, position, frame;

    if (nodeView && node) {
      frame = nodeView.get('frame');
      position = this._getItemPosition(node);

      // generate a random position if it's not present
      if (!position) {
        position = this._genRandomPosition();
        this._setItemPosition(node, position);
      }

      layout = { top: position.x, left: position.y, width: frame.width, height: frame.height };
    }
    return layout;
  },
  
  _updateLinks: function() {
    //console.log('%@._updateLinks()'.fmt(this));
    var links = [];
    var nodes = this.get('content');
     if (nodes) {
       var numNodes = nodes.get('length');
       var node, i, j, nodeLinks, key, len, link;
       var startNode, endNode;
     
       for (i = 0; i < numNodes; i++) {
         node = nodes.objectAt(i);
         if (node && (key = node.get('linksKey'))) {
           nodeLinks = node.get(key);
           links = links.concat(nodeLinks);
         }
       }

       var linkSelection = this.get('linkSelection');
       this.set('linkSelection', null);
       if (linkSelection) {
         var selectedID = LinkIt.genLinkID(linkSelection);
         len = links.get('length');
         for (i = 0; i < len; i++) {
           link = links.objectAt(i);
           if (LinkIt.genLinkID(link) === selectedID) {
             this.set('linkSelection', link);
             link.set('isSelected', YES);
             break;
           }
         }
       }
     }
     this.set('_links', links);
  },

  /**
  */
  _drawLinks: function(context) {
    var links = this.get('_links');
    var numLinks = links.get('length');
    var link, points, i, linkID;
    
    for (i = 0; i < numLinks; i++) {
      link = links.objectAt(i);
      if (link) {
        points = this._endpointsFor(link);
        if (points) {
          link.drawLink(context);
        }
      }
    }
  },
  
  _endpointsFor: function(link) {
    var startTerminal = this._terminalViewFor(link.get('startNode'), link.get('startTerminal'));
    var endTerminal = this._terminalViewFor(link.get('endNode'), link.get('endTerminal'));
    var startPt = null, endPt = null, pv, frame;
    
    if (startTerminal && endTerminal) {
      pv = startTerminal.get('parentView');
      if (pv) {
        frame = pv.convertFrameToView(startTerminal.get('frame'), this);
        startPt = {};
        startPt.x = SC.midX(frame); startPt.y = SC.midY(frame);
        link.set('startPt', startPt);
      }
    
      // Second Find the End
      pv = endTerminal.get('parentView');
      if (pv) {
        frame = pv.convertFrameToView(endTerminal.get('frame'), this);
        endPt = {};
        endPt.x = SC.midX(frame); endPt.y = SC.midY(frame);
        link.set('endPt', endPt);
      }

      var linkStyle = startTerminal.get('linkStyle');
      if (linkStyle) {
        link.set('linkStyle', linkStyle);
      }
    }
    return startPt && endPt ? { startPt: startPt, endPt: endPt } : null;
  },
  
  /**
    pt = mouse click location { x: , y: } in canvas frame space
  */
  _selectLink: function(pt) {
    //console.log('%@._selectLink()'.fmt(this));
    var links = this.get('_links') || [];
    var len = links.get('length');
    var link, dist, i;

    // we compare distances squared to avoid costly square root calculations when finding distances
    var maxDist = (this.LINE_SELECTION_FREEDOM * this.LINE_SELECTION_FREEDOM) || 25;

    this.set('linkSelection', null);
    for (i = 0; i < len; i++) {
      link = links.objectAt(i);
      dist = link.distanceSquaredFromLine(pt);
      if ((SC.typeOf(dist) === SC.T_NUMBER) && (dist <= maxDist)) {
        link.set('isSelected', YES);
        this.set('linkSelection', link);
        break;
      }
      else {
        link.set('isSelected', NO);
      }
    }

    // no more lines to select, just mark all the other lines as not selected
    for (i = i + 1; i < len; i++) {
      link = links.objectAt(i);
      link.set('isSelected', NO);
    }

    // trigger a redraw of the canvas
    this.displayDidChange();
  },
  
  _terminalViewFor: function(node, terminal) {
    var nodeView = this._nodeViewIndex[SC.guidFor(node)];
    if (nodeView && nodeView.terminalViewFor) {
      return nodeView.terminalViewFor(terminal);
    }
    return null;
  },
  
  /**
  */
  _contentDidChange: function() {
    this._nodeSetup();
    this.linksDidChange(); // schedules a links update at the end of the run loop
  }.observes('*content.[]'), // without the '*' at the beginning, this doesn't get triggered
  
  _nodeSetup: function(){
    var nodes = this.get('content');
    var numNodes = 0;
    var node, nodeID;
    
    this.set('_nodeIndex', {});

    if (nodes) {
      numNodes = nodes.get('length');
    
      for (var i = 0; i < numNodes; i++) {
        node = nodes.objectAt(i);
        node.registerInvalidationDelegate(this, 'linksDidChange');

        nodeID =  SC.guidFor(node);
        this._nodeIndex[nodeID] = { node: node };
      }
    }

    // Update the canvas state
    this.set('isEmpty', numNodes <= 0);
  },
  
  /**
    Encapsulates the standard way the dashboard attempts to extract the last
    position from the dashboard element.
    Returns null if unsuccessful.
  */
  _getItemPosition: function(item) {
    var posKey = item ? item.get('positionKey') : null;
    var pos = posKey ? item.get(posKey) : null;

    if (posKey && pos) {
      pos = { x: (parseFloat(pos.x) || 0), y: (parseFloat(pos.y) || 0) };
    }
    
    return pos;
  },
  
  /**
    Encapsulates the standard way the dashboard attempts to store the last
    position on a dashboard element.
  */
  _setItemPosition: function(item, pos) {
    var posKey = item ? item.get('positionKey') : null;

    if (posKey) {
      item.set(posKey, pos);
    }
  },
  
  /**
    Generates a random (x,y) where x=[10, 600), y=[10, 400)
  */
  _genRandomPosition: function() {
    return {
      x: Math.floor(10 + Math.random() * 590),
      y: Math.floor(10 + Math.random() * 390)
    };
  },
  
  // PRIVATE PROPERTIES
  
  /**
  */
  _links: [],

  _nodeIndex: {},
  _nodeViewIndex: {},
  
  /**
    @private: parameters
  */
  _dragData: null
  
});
