/*globals LinkIt*/

LinkIt.NodeView = {
  
  // PUBLIC PROPERTIES
  
  isNodeView: YES,

  isDropTarget: YES,

  displayProperties: ['dropState'],
  
  /*
    @read-only
    The node view can act as a drop target on behalf of one of its terminal views.
    This property stores the currently-proxied terminal view.
    
    The terminal being proxied is determined by implementation of shouldProxyTerminalFor()
    below in views mixing in this mixin.
  */
  proxiedTerminalView: null,

  // PUBLIC METHODS
  
  terminalViewFor: function(terminalKey) {
    return null; // implement this in your node view
  },

  /*
    Stub function; implement this in the view using this mixin.
    Return NO if this node view should not act as a drop proxy for one of its terminal views.
    Return the name of the terminal otherwise.
  */
  shouldProxyTerminalFor: function(drag) {
    return NO; // implement this in your code
  },
  
  willDestroyLayerMixin: function() {
    SC.Drag.removeDropTarget(this);
  },

  renderMixin: function(context, firstTime) {
    var dropState = this.get('dropState'); // drop state
    context.setClass('invite', dropState === LinkIt.INVITE); // addClass if YES, removeClass if NO
    context.setClass('accept', dropState === LinkIt.ACCEPT);
  },
  
  // *** SC.DropTarget ***

  dragStarted: function(drag, evt){
    var terminal = this.shouldProxyTerminalFor(drag);
    terminal = terminal ? this.terminalViewFor(terminal) : null;
    this.set('proxiedTerminalView', terminal);
    if (terminal && terminal._nodeAllowsLink(drag.source)) {
      this.set('dropState', LinkIt.INVITE);
    }
  },
  
  dragEntered: function(drag, evt) {
    this.set('dropState', LinkIt.ACCEPT);
  },
  
  dragExited: function(drag, evt) {
    this.set('dropState', LinkIt.INVITE);
  },

  dragEnded: function(drag, evt) {
    this.set('dropState', null);
  },
  
  computeDragOperations: function(drag, evt) {
    return SC.DRAG_LINK;
  },
  
  acceptDragOperation: function(drag, op) {
    var terminal = this.get('proxiedTerminalView');
    return (terminal && op === SC.DRAG_LINK) ? terminal._nodeAllowsLink(drag.source) : NO; 
  },
  
  performDragOperation: function(drag, op) {
    var terminal = this.get('proxiedTerminalView');
    return terminal ? terminal.performDragOperation(drag, op) : op;
  }
  
};

