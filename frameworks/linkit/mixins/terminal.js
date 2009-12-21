LinkIt.Terminal = {
  
  // PUBLIC PROPERTIES
  
  /**
    For quick checks to see if an object is mixing terminal in
  */
  isTerminal: YES,
  
  /**
    States whether this object is connected
  */
  isLinked: NO,
  
  /**
    May be LinkIt.OUTPUT_TERMINAL, LinkIt.INPUT_TERMINAL, or null.
    If null, will be assumed to be bi-directional.  Bi-directional terminals can connect
    to each other, and to output and input terminals.
  */
  direction: null,

  /**
    The name of this terminal
  */
  terminal: null,

  /**
  */
  linkStyle: null,
  
  /**
  */
  dropState: null,
  
  /**
  */
  displayProperties: ['dropState', 'isLinked', 'linkStyle', 'direction'],
  
  /**
    Will be set automatically
  */
  node: null,
  
  // *** SC.DropTarget ***
  
  /**
    Must be true when your view is instantiated.
    
    Drop targets must be specially registered in order to receive drop
    events.  SproutCore knows to register your view when this property
    is true on view creation.
  */  
  isDropTarget: YES,

  // PUBLIC METHODS
  
  initMixin: function() {
    //LinkIt.log('%@.initMixin()'.fmt(this));
    this.isLinked = NO;
  },

  /**
    Unregister this view as a drop target when it gets destroyed
  */
  willDestroyLayerMixin: function() {
    //console.log('%@.willDestroyLayerMixin()'.fmt(this));
    SC.Drag.removeDropTarget(this);
  },
  
  renderMixin: function(context, firstTime) {
    //LinkIt.log('%@.renderMixin()'.fmt(this));
    var links = this.get('links');
    context.setClass('connected', this.get('isLinked'));
    
    // drop state
    var dropState = this.get('dropState');
    // Invite class
    context.setClass('invite', dropState === LinkIt.INVITE); // addClass if YES, removeClass if NO
    // Accept class
    context.setClass('accept', dropState === LinkIt.ACCEPT);
  },
  
  // *** LinkIt.Terminal API ***

  /**
    Return yes if someone is allowed to start dragging a link from this terminal.
    Not the same as canLink() above in that linking this terminal to another may still
    be allowed, just not triggered by a drag from this terminal.
  */
  canDragLink: function() {
    return YES;
  },

  /**
    Return yes if someone is allowed to drop a link onto this terminal.
    Not the same as canLink() above in that linking this terminal to another may still
    be allowed, just not triggered by a drop onto this terminal.
  */
  canDropLink: function() {
    return YES;
  },
  
  /**
    Only gets called if linking is acceptable.  Notifies you that someone
    has started dragging a link somewhere on the canvas that could connect
    to this terminal.
  */
  linkDragStarted: function() {
    //LinkIt.log('%@.linkStarted()'.fmt(this));
  },
  
  /**
    Notifies you that a dragged link has been finished or cancelled.
  */
  linkDragEnded: function() {
    //LinkIt.log('%@.linkEnded()'.fmt(this));
  },

  /**
    Notifies you that someone has dragged a link over this terminal but has
    not dropped it yet.
  */
  linkDragEntered: function() {
    //LinkIt.log('%@.linkEntered()'.fmt(this));
  },

  /**
    Notifies you that a link dragged over this terminal has now left without
    connecting.
  */
  linkDragExited: function() {
    //LinkIt.log('%@.linkExited()'.fmt(this));
  },

  // *** Mouse Events ***

  mouseDown: function(evt) {
    this._mouseDownEvent = evt;
    this._mouseDownAt = Date.now();
    return YES;
  },
  
  mouseDragged: function(evt) {
    if (this.canDragLink() && this._mouseDownEvent) {
      // Build the drag view to use for the ghost drag.  This 
      // should essentially contain any visible drag items.
      var layer = LinkIt.getLayer(this);

      if (layer) {
        var parent = this.get('parentView');    
        var fo = parent.convertFrameFromView(parent.get('frame'), this);
        var frame = this.get('frame');
        var startX = fo.x + (frame.width/2);
        var startY = fo.y + (frame.height/2);
        var color = this.get('linkDragColor');

        var dragLink = LinkIt.DragLink.create({
          layout: {left: 0, top: 0, right: 0, bottom: 0},
          startPt: {x: startX, y: startY},
          endPt: {x: startX, y: startY},
          linkStyle: this.get('linkStyle')
        });
        layer.appendChild(dragLink);
      
        // Initiate the drag
        var drag = SC.Drag.start({
          event: this._mouseDownEvent,
          dragLink: dragLink,
          source: this, // terminal
          dragView: SC.View.create({ layout: {left: 0, top: 0, width: 0, height: 0}}),
          ghost: NO,
          slideBack: YES,
          dataSource: this,
          anchorView: layer
        });
      }

      // Also use this opportunity to clean up since mouseUp won't 
      // get called.
      this._cleanupMouseDown() ;
    }    
    return YES ;
  },
  
  mouseUp: function(evt) {
    this._cleanupMouseDown();
    return YES; // just absorb the mouse event so that LinkIt.CanvasView (SC.CollectionView) doesn't complain.
  },
    
  // *** SC.DragSource ***
  
  /**
    This method must be overridden for drag operations to be allowed. 
    Return a bitwise OR'd mask of the drag operations allowed on the
    specified target.  If you don't care about the target, just return a
    constant value.
  
    @param {SC.View} dropTarget The proposed target of the drop.
    @param {SC.Drag} drag The SC.Drag instance managing this drag.
  
  */
  dragSourceOperationMaskFor: function(drag, dropTarget) {
    return this._nodeAllowsLink(dropTarget) ? SC.DRAG_LINK : SC.DRAG_NONE;
  },

  /**  
    This method is called when the drag begins. You can use this to do any
    visual highlighting to indicate that the receiver is the source of the 
    drag.
  
    @param {SC.Drag} drag The Drag instance managing this drag.
  
    @param {Point} loc The point in *window* coordinates where the drag 
      began.  You can use convertOffsetFromView() to convert this to local 
      coordinates.
  */
  dragDidBegin: function(drag, loc) {
    //LinkIt.log('%@.dragDidBegin()'.fmt(this));
  },
  
  /**
    This method is called whenever the drag image is moved.  This is
    similar to the dragUpdated() method called on drop targets.

    @param {SC.Drag} drag The Drag instance managing this drag.

    @param {Point} loc  The point in *window* coordinates where the drag 
      mouse is.  You can use convertOffsetFromView() to convert this to local 
      coordinates.
  */
  dragDidMove: function(drag, loc) {
    var dragLink = drag.dragLink;
    var endX, endY;

    if (dragLink) {
      // if using latest SproutCore 1.0, loc is expressed in browser window coordinates
      var pv = dragLink.get('parentView');
      var frame = dragLink.get('frame');
      var globalFrame = pv ? pv.convertFrameToView(frame, null) : frame;
      if (globalFrame) {
        endX = loc.x - globalFrame.x;
        endY = loc.y - globalFrame.y;
        dragLink.set('endPt', {x: endX , y: endY});
      }
    }
  },
  
  /**  
    This method is called when the drag ended. You can use this to do any
    cleanup.  The operation is the actual operation performed on the drag.
  
    @param {SC.Drag} drag The drag instance managing the drag.
  
    @param {Point} loc The point in WINDOW coordinates where the drag 
      ended. 
  
    @param {DragOp} op The drag operation that was performed. One of 
      SC.DRAG_COPY, SC.DRAG_MOVE, SC.DRAG_LINK, or SC.DRAG_NONE.
  
  */
  dragDidEnd: function(drag, loc, op) {
    //LinkIt.log('%@.dragDidEnd()'.fmt(this));
    var dragLink = drag.dragLink;
    if (dragLink) {
      dragLink.destroy();
    }
  },
  
  // *** SC.DropTarget ***

  dragStarted: function(drag, evt){
    // Only notify permissible terminals
    if (this._nodeAllowsLink(drag.source)) {
      this.set('dropState', LinkIt.INVITE);
      this.linkDragStarted();
    }
  },
  
  dragEntered: function(drag, evt) {
    this.set('dropState', LinkIt.ACCEPT);
    this.linkDragEntered();
  },
  
  dragExited: function(drag, evt) {
    this.set('dropState', LinkIt.INVITE);
    this.linkDragExited();
  },

  dragEnded: function(drag, evt) {
    this.set('dropState', null);
    this.linkDragEnded();
  },
  
  // TODO: [JL] I don't think this is necessary...can just return SC.DRAG_LINK!
  computeDragOperations: function(drag, evt) {
    //LinkIt.log('%@.computeDragOperations()'.fmt(this));
    //return (this.canDropLink() && this._nodeAllowsLink(drag.source)) ? SC.DRAG_LINK : SC.DRAG_NONE;
    return SC.DRAG_LINK;
  },
  
  acceptDragOperation: function(drag, op) {
    //LinkIt.log('%@.acceptDragOperation()'.fmt(this));
    var accept = (op === SC.DRAG_LINK) ? this._nodeAllowsLink(drag.source) : NO; 
    return accept;
  },
  
  performDragOperation: function(drag, op) {
    //LinkIt.log('%@.performDragOperation()'.fmt(this));
    var node = this.get('node');
    var otherTerminal = drag.source;
    if (node && otherTerminal) {
      var otherNode = otherTerminal.get('node');
      if (otherNode) {
        var links = this._createLinkObject(this, node, otherTerminal, otherNode);
        node.createLink( links[0] ) ;
        otherNode.createLink( links[1] );
      }
    }
    return op;
  },
  
  // PRIVATE METHODS

  _nodeAllowsLink: function(otherTerminal) {
    var myLinkObj, myNodeAccepted, otherLinkObj, otherNodeAccepted;
    if (otherTerminal && otherTerminal.get('isTerminal')) {
      var myNode = this.get('node');
      var otherNode = otherTerminal.get('node');
      
      // First, Check our node
      var links = this._createLinkObject(this, myNode, otherTerminal, otherNode);
      myNodeAccepted =  myNode ? myNode.canLink( links[0] ) : NO;
      otherNodeAccepted = (otherNode && myNodeAccepted) ? otherNode.canLink( links[1] ) : NO;
      
      // Next, Check their node
      //otherLinkObj = this._createLinkObject(otherTerminal, otherNode, this, myNode);
      //otherNodeAccepted = otherNode ? otherNode.canLink( SC.Object.create( LinkIt.Link, otherLinkObj )) : NO;
      
    }
    return (myNodeAccepted && otherNodeAccepted);
  },
  
  /**
    When we check the Nodes we must make a judgement for each of the directions
    Unaccepted:
      Output => Output
      Intputs => Inputs
    Accepted:
      Output (start) => Input (end)
      Bidirectional (start) => Input (end)
      Output (start) => Bidirectional (end)
      Bidirectional (start) => Bidirectional (end) && Bidirectional (end) => Bidirectional (start)
    
  */
  _createLinkObject: function(startTerminal, startNode, endTerminal, endNode){
    var tempHash = {};
    var startObj, endObj;
    // First, we need to get the direction of both terminals
    if (startNode && endNode){
      var sDir = startTerminal.get('direction');
      var eDir = endTerminal.get('direction');
      
      // Check to see if they are of unaccepted types
      if (sDir && sDir === eDir) return [null, null];
      
      if (sDir === LinkIt.OUTPUT_TERMINAL && (eDir === LinkIt.INPUT_TERMINAL || eDir === null) ){
        
        tempHash.direction = sDir;
        tempHash.startNode = startNode;
        tempHash.startTerminal = startTerminal.get('terminal');
        tempHash.startTerminalView = startTerminal;
        tempHash.endNode = endNode;
        tempHash.endTerminal = endTerminal.get('terminal');
        tempHash.endTerminalView = endTerminal;
        //console.log('\nUni: (%@).%@ => (%@).%@'.fmt(SC.guidFor(startNode), tempHash.startTerminal, SC.guidFor(endNode), tempHash.endTerminal));
        startObj = SC.Object.create( LinkIt.Link, tempHash );
        return [startObj, startObj];
      }
      else if (sDir === LinkIt.INPUT_TERMINAL && (eDir === LinkIt.OUTPUT_TERMINAL || eDir === null) ){
        tempHash.direction = eDir;
        tempHash.startNode = endNode;
        tempHash.startTerminal = endTerminal.get('terminal');
        tempHash.startTerminalView = endTerminal;
        tempHash.endNode = startNode;
        tempHash.endTerminal = startTerminal.get('terminal');
        tempHash.endTerminalView = startTerminal;
        //console.log('\nUni: (%@).%@ => (%@).%@'.fmt(SC.guidFor(endNode), tempHash.startTerminal, SC.guidFor(startNode), tempHash.endTerminal));
        startObj = SC.Object.create( LinkIt.Link, tempHash );
        return [startObj, startObj];
      }
      else { // Bi Directional
        tempHash.direction = sDir;
        tempHash.startNode = startNode;
        tempHash.startTerminal = startTerminal.get('terminal');
        tempHash.startTerminalView = startTerminal;
        tempHash.endNode = endNode;
        tempHash.endTerminal = endTerminal.get('terminal');
        tempHash.endTerminalView = endTerminal;
        startObj = SC.Object.create( LinkIt.Link, tempHash );
        //console.log('\nBi: (%@).%@ => (%@).%@'.fmt(SC.guidFor(startNode), tempHash.startTerminal, SC.guidFor(endNode), tempHash.endTerminal));
        
        tempHash.direction = eDir;
        tempHash.startNode = endNode;
        tempHash.startTerminal = endTerminal.get('terminal');
        tempHash.startTerminalView = endTerminal;
        tempHash.endNode = startNode;
        tempHash.endTerminal = startTerminal.get('terminal');
        tempHash.endTerminalView = startTerminal;
        endObj = SC.Object.create( LinkIt.Link, tempHash );
        //console.log('Bi: (%@).%@ => (%@).%@'.fmt(SC.guidFor(endNode), tempHash.startTerminal, SC.guidFor(startNode), tempHash.endTerminal));
        return [startObj, endObj];
      }
    }
  },
  
  /**
    @private
  */
  _cleanupMouseDown: function() {
    this._mouseDownEvent = this._mouseDownAt = null ;
  }

};

