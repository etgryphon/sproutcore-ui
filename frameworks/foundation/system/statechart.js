// ==========================================================================
// SCUI.Statechart
// ==========================================================================

/**
  @namespace
  
  A most excellent statechart implementation
  
  @author: Mike Ball
  @version: 0.1
  @since: 0.1
*/
SCUI.DEFAULT_TREE = 'default';

SCUI.Statechart = {
  
  isStatechart: true,
  
  init: function(){
    debugger;
    this._all_states = {};
    this._all_states[SCUI.DEFAULT_TREE] = {};
    this._current_state = {};
    this._current_state[SCUI.DEFAULT_TREE] = null;
    this._inited = true;
    sc_super();
  },
  
  registerState: function(stateDefinition, stateManager){
    if(!stateManager) stateManager = this;
    
    //if(!this._inited) this.initStateManager();
        
    if(!stateManager.isStatechart) throw 'Cannot register a state without a State Manager!';
    
    var state, tree;
    //create the state object
    state = SCUI.State.create(stateDefinition);
    state.set('stateManager', stateManager);
    
    tree = state.get('parallelTree') || SCUI.DEFAULT_TREE;
    stateManager._addState(state.get('name'), state, tree);
    //push state onto list of states
    
    return state;
  },
  
  goState: function(requestdState, tree){
    var currentState = this._current_state[tree],
        enterStates = [],
        exitStates = [],
        enterMatchIndex,
        exitMatchIndex,
        pivotState,
        i;
    requestdState = this._all_states[tree][requestdState];
    if(!requestdState) throw 'Could not find the requested state!';

    enterStates = this._parentStates(requestdState, this._all_states[tree]);
    exitStates = currentState ? this._parentStates(currentState, this._all_states[tree]) : [];
    
    //find common ancestor
    // YES this is O(N^2) but will do for now....
    pivotState = exitStates.forEach(function(item,index){
      exitMatchIndex = index;
      enterMatchIndex = enterStates.indexOf(item);
      if(enterMatchIndex >= 0) return YES;
    });
    
    //call enterState and exitState on all states
    for(i = 0; i < exitMatchIndex; i += 1){
      //TODO store history state
      exitStates[i].exitState();
    }
    
    for(i = 0; i < enterMatchIndex; i += 1){
      //TODO call initState?
      enterStates[i].enterState();
    }
    
    this._current_state[tree] = requestdState;
  },
  
  currentState: function(tree){
    tree = tree || SCUI.DEFAULT_TREE;
    return this._current_state[tree];
  },
  
  /**
    Send the passed action down the responder chain, starting with the 
    current first responder.  This will look for the first responder that 
    actually implements the action method and returns YES or no value when 
    called.
    
    @param {String} action name of action
    @param {Object} sender object sending the action
    @param {Object} context optional additonal context info
    @returns {SC.Responder} the responder that handled it or null
  */
  sendAction: function(action, sender, context) {
    var trace = this.get('trace'),
        handled = NO,
        currentStates = this._current_state,
        responder;
    
    this._locked = YES;
    if (trace) {
      console.log("%@: begin action '%@' (%@, %@)".fmt(this, action, sender, context));
    }
    
    for(var tree in currentStates){
      if(currentStates.hasOwnProperty(tree)){
        handled = NO;
        
        responder = currentStates[tree];
       
        while(!handled && responder){
          if(responder.tryToPerform){
            handled = responder.tryToPerform(action, sender, context);
          }
          
          if(!handled) responder = responder.get('parentState') ? this._all_states[tree][responder.get('parentState')] : null;
        }
        
        if (trace) {
          if (!handled) console.log("%@:  action '%@' NOT HANDLED in tree %@".fmt(this,action, tree));
          else console.log("%@: action '%@' handled by %@ in tree %@".fmt(this, action, responder.get('name'), tree));
        }
      }
    }
    
    this._locked = NO ;
    
    return responder ;
  },
  
  
  
  _addState: function(name, state, tree){
    if(!this._all_states[tree]) this._all_states[tree] = {};
    if(this._all_states[tree][name]) throw 'Trying to add state %@ to state tree %@ and it already exists'.fmt(name, tree);
    this._all_states[tree][name] = state;
  },
  
  
  _parentStates: function(state, tree){
    var ret = [], curr = state;
    
    //always add the first state
    ret.push(curr);
    curr = curr.get('parentState');
    
    while(curr.get && tree[curr.get('parentState')]){
      ret.push(tree[curr]);
      curr = tree[curr.get('parentState')];
    }
    //always push the root
    ret.push('root');
    return ret;
  }
  
 
};
