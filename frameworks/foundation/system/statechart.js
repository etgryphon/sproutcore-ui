// ==========================================================================
// SCUI.Statechart
// ==========================================================================
/*globals SCUI */

require('system/state');
/**
  @namespace
  
  A most excellent statechart implementation
  
  @author: Mike Ball
  @author: Michael Cohen
  @author: Evin Grano
  @author: Jonathan Lewis
  @version: 0.1
  @since: 0.1
*/

SCUI.Statechart = {
  
  isStatechart: true,
  
  /**
    Log level bit field definitions.  Combine these in any way desired
    using bitwise operations and apply to 'logLevel'.
  */
  LOG_NONE: 0,
  LOG_STATE_CHANGES: 1,
  LOG_SENT_EVENTS: 2,
  LOG_HANDLED_EVENTS: 4,
  LOG_UNHANDLED_EVENTS: 8,
  LOG_ALL_EVENTS: 14,
  LOG_ALL: 15,

  logLevel: 0,
  
  initMixin: function(){
    //setup data
    this._all_states = {};
    this._all_states[SCUI.DEFAULT_TREE] = {};
    this._current_state = {};
    this._current_state[SCUI.DEFAULT_TREE] = null;
    this._goStateLocked = NO;
    this._sendEventLocked = NO;
    this._pendingStateTransitions = [];
    this._pendingActions = [];
    //alias sendAction
    this.sendAction = this.sendEvent;
    if(this.get('startOnInit')) this.startupStatechart();
  },
  
  startOnInit: YES,
  
  statechartIsStarted: NO,
  
  startupStatechart: function(){
    //add all unregistered states
    if (!this.get('statechartIsStarted')) {
      var key, tree, state, trees, startStates, startState, currTree;
      for(key in this){
        if(this.hasOwnProperty(key) && SC.kindOf(this[key], SCUI.State) && this[key].get && !this[key].get('beenAddedToStatechart')){
          state = this[key];
          this._addState(key, state);
        }
      }
      trees = this._all_states;
      //init the statechart
      for(key in trees){  
        if(trees.hasOwnProperty(key)){
          tree = trees[key];
          //for all the states in this tree
          for(state in tree){
            if(tree.hasOwnProperty(state)){
              tree[state].initState();
            }
          }
        }
      }
      //enter the startstates
      startStates = this.get('startStates');
      if(!startStates) throw 'Please add startStates to your statechart!';
      
      for(key in trees){  
        if(trees.hasOwnProperty(key)){
          startState = startStates[key];
          currTree = trees[key];
          if(!startState) console.error('The parallel statechart %@ must have a start state!'.fmt(key));
          if(!currTree) throw 'The parallel statechart %@ does not exist!'.fmt(key);
          if(!currTree[startState]) throw 'The parallel statechart %@ doesn\'t have a start state [%@]!'.fmt(key, startState);
          this.goState(startState, key);
        }
      }
    }
    this.setIfChanged('statechartIsStarted', YES);
  },
  
  
  /**
    Adds a state to a state manager
    
    if the stateManager and stateName objects are blank it is assumed
    that this state will be picked up by the StateManger's init
    
    @param {Object} the state definition
    @param {SC.Object} Optional: Any SC.Object that mixes in SCUI.Statechart 
    @param {String} Optional: the state name
    @returns {SCUI.State} the state object
  */
  registerState: function(stateDefinition, stateManager, stateName){
    
    var state, tree;
    //create the state object
    state = SCUI.State.create(stateDefinition);
    
    //passed in optional arguments
    if(stateManager && stateName){
      if(stateManager.isStatechart){

        stateManager._addState(stateName, state);
        state.initState();
      }
      else{
        throw 'Cannot add state: %@ because state manager does not mixin SCUI.Statechart'.fmt(state.get('name'));
      }
    }
    else{
      state.set('beenAddedToStatechart', NO);
    }
    //push state onto list of states
    
    return state;
  },
  
  goHistoryState: function(requestedState, tree, isRecursive){
    var allStateForTree = this._all_states[tree],
        pState, realHistoryState;
    if(!tree || !allStateForTree) throw 'State requesting go history does not have a valid parallel tree';
    pState = allStateForTree[requestedState];
    if (pState) realHistoryState = pState.get('history') || pState.get('initialSubState');

    if (!realHistoryState) {
      if (!isRecursive) console.warn('Requesting History State for [%@] and it is not a parent state'.fmt(requestedState));
      realHistoryState = requestedState;
      this.goState(realHistoryState, tree);
    }
    else if (isRecursive) {
      this.goHistoryState(realHistoryState, tree, isRecursive);
    }
    else {
      this.goState(realHistoryState, tree);
    }
  },
  
  goState: function(requestedStateName, tree) {
    var currentState = this._current_state[tree],
        enterStates = [],
        exitStates = [],
        enterMatchIndex,
        exitMatchIndex,
        requestedState, pivotState, pState, cState,
        i, logLevel = this.get('logLevel'), loggingStr;
             
    if (!tree) throw '#goState: State requesting go does not have a valid parallel tree';
    
    requestedState = this._all_states[tree][requestedStateName];
    
    if (!requestedState) throw '#goState: Could not find the requested state: %@'.fmt(requestedStateName);

    if (this._goStateLocked) {
      // There is a state transition currently happening. Add this requested state
      // transition to the queue of pending state transitions. The request will
      // be invoked after the current state transition is finished.
      this._pendingStateTransitions.push({
        requestedState: requestedState,
        tree: tree
      });

      // Logging
      if (logLevel & SCUI.Statechart.LOG_STATE_CHANGES) {
        console.info('%@: added [%@] to pending state transitions queue for [%@]'.fmt(this, requestedState, tree));
      }

      return;
    }

    // do nothing if we're already in the requested state
    if (currentState === requestedState) {
      return;
    }
    
    // Lock the current state transition so that no other requested state transition 
    // interferes. 
    this._goStateLocked = YES;

    // Get the parent states for the current state and the registered state. We will
    // use them to find a common parent state. 
    enterStates = this._parentStates_with_root(requestedState);
    exitStates = currentState ? this._parentStates_with_root(currentState) : [];
  
    // Continue by finding the common parent state for the current and requested states
    //
    // At most, this takes O(m^2) time, where m is the maximum depth from the
    // root of the tree to either the requested state or the current state. 
    // Will always be less than or equal to O(n^2), where n is the number of 
    // states in the tree.
    pivotState = exitStates.find(function(item,index){
      exitMatchIndex = index;
      enterMatchIndex = enterStates.indexOf(item);
      if (enterMatchIndex >= 0) return YES;
    });
      
    // Looks like we were unable to find a common parent state. This means that we
    // must enter from the root state in the tree
    if (!enterMatchIndex) enterMatchIndex = enterStates.length - 1;
    
    // Now, from the current state, exit up the parent states to the common parent state, 
    // but don't exit the common parent itself since you are technically still in it.
    loggingStr = "";
    for (i = 0; i < exitMatchIndex; i += 1) {
      // Logging
      if (logLevel & SCUI.Statechart.LOG_STATE_CHANGES) {
        loggingStr += 'Exiting State: [%@] in [%@]\n'.fmt(exitStates[i], tree);
      }

      exitStates[i].exitState();
    }
    
    // Logging
    if (logLevel & SCUI.Statechart.LOG_STATE_CHANGES) {
      console.info(loggingStr);
    }
    
    // Finally, from the the common parent state, but not including the parent state, enter the 
    // sub states down to the requested state. If the requested state has an initial sub state
    // then we must enter it too.
    loggingStr = "";
    for (i = enterMatchIndex-1; i >= 0; i -= 1) {
      //TODO call initState?
      cState = enterStates[i];
      
      // Logging
      if (logLevel & SCUI.Statechart.LOG_STATE_CHANGES) {
        loggingStr += 'Entering State: [%@] in [%@]\n'.fmt(cState, tree);
      }

      pState = enterStates[i+1];
      if (pState && SC.typeOf(pState) === SC.T_OBJECT) pState.set('history', cState.name);
      cState.enterState();

      if (cState === requestedState) {
        // Make sure to enter the requested state's initial sub state!
        cState.enterInitialSubState(this._all_states[tree || SCUI.DEFAULT_TREE]);
      }
    }

    // Logging
    if (logLevel & SCUI.Statechart.LOG_STATE_CHANGES) {
      console.info(loggingStr);
    }
    
    // Set the current state for this state transition
    this._current_state[tree] = requestedState;
            
    // Okay. We're done with the current state transition. Make sure to unlock the
    // goState and let other pending state transitions execute.
    this._goStateLocked = NO;
    this._flushPendingStateTransition();
    
    // Once pending state transitions are flushed then go ahead and start flush pending
    // actions
    this._flushPendingActions();
  },
  
  /** @private
  
    Called by goState to flush a pending state transition at the front of the 
    pending queue.
  */
  _flushPendingStateTransition: function() {
    var logLevel = this.get('logLevel');
    var pending = this._pendingStateTransitions.shift();
    var msg;

    if (!pending) return;

    // Logging
    if (logLevel & SCUI.Statechart.LOG_STATE_CHANGES) {
      msg = '%@: performing pending state transition for requested state [%@] in [%@]';
      console.info(msg.fmt(this, pending.requestedState, pending.tree));
    }

    this.goState(pending.requestedState, pending.tree);
  },
  
  currentState: function(tree){
    tree = tree || SCUI.DEFAULT_TREE;
    return this._current_state[tree];
  },
  
  isInState: function(state, tree){
    tree = tree || SCUI.DEFAULT_TREE;
    var allStates = this._all_states[tree],
        currState = this.currentState(tree),
        ret = NO;
    var currStack = this._parentStates(currState) || [];
    if (SC.typeOf(state) === SC.T_STRING) state = allStates[state];
    currStack.forEach( function(item){
      if (!ret && item === state) ret = YES;
    });
    return ret;
  },
  
  //Walk like a duck
  isResponderContext: YES,
  
  /**
    Sends the event to all the parallel state's current state
    and walks up the graph looking if current does not respond
    
    @param {String} action name of action
    @param {Object} sender object sending the action
    @param {Object} context optional additonal context info
    @returns {SC.Responder} the responder that handled it or null
  */
  sendEvent: function(action, sender, context) {
    var logLevel = this.get('logLevel'),
        handled = NO,
        currentStates = this._current_state,
        responder;
    
    if (this._sendEventLocked || this._goStateLocked) {
      // Want to prevent any actions from being processed by the states until 
      // they have had a chance to handle handle the most immediate action or 
      // completed a state transition
      this._pendingActions.push({
        action: action,
        sender: sender,
        context: context
      });
      
      // Logging
      if (logLevel & SCUI.Statechart.LOG_SENT_EVENTS) {
        console.info('%@: added %@ to pending actions queue'.fmt(this, action));
      }

      return;
    }
    
    this._sendEventLocked = YES;
    
    if (logLevel & SCUI.Statechart.LOG_SENT_EVENTS) {
      console.info("%@: begin action '%@' (%@, %@)".fmt(this, action, sender, context));
    }
    
    for(var tree in currentStates){
      if(currentStates.hasOwnProperty(tree)){
        handled = NO;
        
        responder = currentStates[tree];
        
        if (!responder.get) continue;
       
        while(!handled && responder){
          if(responder.tryToPerform){
            try{
              handled = responder.tryToPerform(action, sender, context);
            } catch(exp){
              console.error("Exception occurred while trying perform action: %@ \n %@".fmt(action,exp));
              if (SC.ExceptionHandler) {
                SC.ExceptionHandler.handleException(exp);
              }
            }
          }
          if(!handled) responder = responder.get('parentState') ? this._all_states[tree][responder.get('parentState')] : null;
        }
        
        // Logging
        if (!handled && (logLevel & SCUI.Statechart.LOG_UNHANDLED_EVENTS)) {
          console.info("%@:  action '%@' NOT HANDLED in tree %@".fmt(this,action, tree));
        }
        else if (handled && (logLevel & SCUI.Statechart.LOG_HANDLED_EVENTS)) {
          console.info("%@: action '%@' handled by %@ in tree %@".fmt(this, action, responder.get('name'), tree));
        }
      }
    }
    
    // Now that all the states have had a chance to process the 
    // first action, we can go ahead and flush any pending actions.
    this._sendEventLocked = NO;
    this._flushPendingActions();
    
    return responder ;
  },
  
  /** @private

     Called by sendEvent to flush a pending actions at the front of the pending
     queue
   */
  _flushPendingActions: function() {
    var pending = this._pendingActions.shift();

    if (!pending) return;
    
    // Logging
    if (this.get('logLevel') & SCUI.Statechart.LOG_SENT_EVENTS) {
      console.info('%@: firing pending action %@'.fmt(this, pending.action));
    }
    else{
      this.toString(); //HACK: [MB] prevents crashes for now...
    }

    this.sendEvent(pending.action, pending.sender, pending.context);
  },

  _addState: function(name, state){
    state.set('stateManager', this);
    state.set('name', name);
    var tree = state.get('parallelStatechart') || SCUI.DEFAULT_TREE;
    state.setIfChanged('parallelStatechart', tree);
    
    if(!this._all_states[tree]) this._all_states[tree] = {};
    if(this._all_states[tree][name]) throw 'Trying to add state %@ to state tree %@ and it already exists'.fmt(name, tree);
    this._all_states[tree][name] = state;
    
    state.set('beenAddedToStatechart', YES);
  },
  
  
  _parentStates: function(state){
    var ret = [], curr = state;
    
    //always add the first state
    ret.push(curr);
    curr = curr.get('parentStateObject');
    
    while(curr){
      ret.push(curr);
      curr = curr.get('parentStateObject');
    }
    return ret;
  },
  
  _parentStates_with_root: function(state){
    var ret = this._parentStates(state);
    //always push the root
    ret.push('root');
    return ret;
  },
  
  parentStateObject: function(name, tree){
    if(name && tree && this._all_states[tree] && this._all_states[tree][name]){
      return this._all_states[tree][name];
    }
    return null;
  }
};

