// ==========================================================================
// SCUI.State
// ==========================================================================

/**
  @namespace
  
  TODO:  Documentation!
  
  @author: Mike Ball
  @author: Michael Cohen
  @author: Evin Grano
  @version: 0.1
  @since: 0.1
*/
SCUI.State = SC.Object.extend({
  
  
  
  initState: function(){
    
  },
  
  enterState: function(){
    
  },
  
  exitState: function(){
    
  },
  
  parallelStatechart: SCUI.DEFAULT_STATE,
  
  parentState: null,
  
  initialSubState: null,
  
  state: function(){
    var sm = this.get('stateManager');
    if(!sm) throw 'Cannot access the current state because state does not have a state manager';
    return sm.currentState(this.get('parallelStatechart'));
  },
  
  
  goState: function(name){
    var sm = this.get('stateManager');
    if(sm){
      sm.goState(name, this.get('parallelStatechart'));
    }
    else{
      throw 'Cannot goState cause state does not have a stateManager!';
    }
  },
  
  startupStates: function(tree){
    this.enterState();
    var initialSubState = this.get('initialSubState');
    
    if(initialSubState){
      if(!tree[initialSubState]) throw 'Cannot find initial sub state: %@ defined on state: %@'.fmt(initialSubState, this.get('name'));
      tree[initialSubState].startupStates(tree);
    }
  }
  
 
});
