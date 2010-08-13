// ==========================================================================
// LinkIt
// ==========================================================================

/*globals LinkIt*/

/** @class

  This is the grouping where all utility functions will live

  @extends SC.Object
  @author Evin Grano
  @version: 0.1
*/
window.LinkIt = SC.Object.create({

  // CONST
  ROUND: 'round',
  
  FORWARD: 'forward',
  REVERSE: 'reverse',
  
  // Drag Types
  OUTPUT_TERMINAL: 'LinkIt.TerminalOutput',
  INPUT_TERMINAL: 'LinkIt.TerminalInput',
  
  // Respond to Linking
  NEVER: 'never',
  DIRECTIONAL: 'dir',
  INVERSE_DIRECTIONAL: 'idir',
  ALWAYS: 'always',
  
  // Terminals Drop State
  INVITE: 'invite',
  ACCEPT: 'accept',
  
  // Line Styling
  HORIZONTAL_CURVED: 'hcurved',
  VERTICAL_CURVED: 'vcurved',
  STRAIGHT: 'straight',
  PIPES: 'pipes',
  
  /**
    See log() method below.  For development purposes, many methods in LinkIt
    log messages to LinkIt.log() instead of console.log() to give us a central place
    to turn console messages on/off.  LinkIt.log() checks this setting prior to
    logging the messages to the console.
  */
  logToConsole: YES,
  
  /**  
    Utility Functions
  */
  getLayer: function(view){
    if (view.kindOf(LinkIt.CanvasView)) {
      return view;
    }
    else {
      var parent = view.get('parentView');
      if (parent) {
        return this.getLayer(parent);
      }
      else {
        LinkIt.log('Error: No layer to be found!');
      }
    }
    return null;
  },
  
  getContainer: function(view){
    if (view.kindOf(LinkIt.NodeContainerView)) {
      return view;
    }
    else {
      var parent = view.get('parentView');
      if (parent) {
        return this.getContainer(parent);
      }
      else {
        LinkIt.log('Error: No Container To Be Found!');
      } 
    }
    return null;
  },
  
  genLinkID: function(link) {
    if (link) {
      var startNode = link.get('startNode');
      var startTerm = link.get('startTerminal');
      var endNode = link.get('endNode');
      var endTerm = link.get('endTerminal');
      var startID = [SC.guidFor(startNode), startTerm].join('_');
      var endID = [SC.guidFor(endNode), endTerm].join('_');
      return (startID < endID) ? [startID, endID].join('_') : [endID, startID].join('_');
    }
    return '';
  },
  
  /**
    Many LinkIt methods call here to log to the console so that we have a central
    place for turning console logging on/off.  For debugging purposes.
  */
  log: function(message) {
    if (this.logToConsole) {
      console.log(message);
    }
  }
  
});

