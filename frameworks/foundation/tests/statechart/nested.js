// ==========================================================================
// SCUI.Statechart Unit Test
// ==========================================================================
/**
  @author Mike Ball
*/
var nested, exitTotal, enterTotal;

// ..........................................................
// CONTENT CHANGING
// 

module("SCUI.Statechart Mixin Nested Statechart", {
  setup: function() {
    enterTotal = exitTotal = 0;
    nested = SC.Object.create(SCUI.Statechart,{
      startStates: {'default': 'a', 'other': 'f'},
      startOnInit: YES,
      
      a: SCUI.Statechart.registerState({initialSubState: 'b', enterState: function(){ enterTotal+=1; }, exitState: function(){ exitTotal+=1; }}),
      b: SCUI.Statechart.registerState({parentState: 'a', initialSubState: 'c', enterState: function(){ enterTotal+=1; }, exitState: function(){ exitTotal+=1; }}),
      c: SCUI.Statechart.registerState({parentState: 'b', enterState: function(){ enterTotal+=1; }, exitState: function(){ exitTotal+=1; }}),
      d: SCUI.Statechart.registerState({parentState: 'b', enterState: function(){ enterTotal+=1; }, exitState: function(){ exitTotal+=1; }}),
      e: SCUI.Statechart.registerState({enterState: function(){ enterTotal+=1; }, exitState: function(){ exitTotal+=1; }}),
      f: SCUI.Statechart.registerState({parallelStatechart:'other'}),
      g: SCUI.Statechart.registerState({parallelStatechart:'other'})
      
    
    });
  },
  
  teardown: function() {
    nested.destroy();
    exitTotal = enterTotal = 0;
  }
});

test("nested state initialization", function() {
  equals(nested.get('c'), nested.get('c').state(), "c state should be the current state for default statechart");
  equals(nested.get('f'), nested.get('f').state(), "f state should be the current state for other statechart");
});

test("nested state transition", function() {
  var c = nested.get('c');
  equals(c, c.state(), "c state should be the current state for default statechart");
  equals(enterTotal, 3, "should have entered 3 states");
  equals(exitTotal, 0, "should have exited 0 states");
  
  enterTotal = exitTotal = 0;

  c.goState('e');
  equals(nested.get('e'), nested.get('e').state(), "e state should be the current state for other statechart");
  equals(enterTotal, 1, "should have entered 1 state after transition");
  equals(exitTotal, 3, "should have exited 3 states after transition");
});

test("test inState method", function(){
  ok(nested.isInState(nested.a), "checking with the object, should be in state 'a' [default]");
  ok(nested.isInState(nested.b), "checking with the object, should be in state 'b' [default]");
  ok(nested.isInState(nested.c), "checking with the object, should be in state 'c' [default]");
  
  ok(nested.isInState('a'), "checking with the string, should be in state 'a' in [default]");
  ok(nested.isInState('b'), "checking with the string, should be in state 'b' in [default]");
  ok(nested.isInState('c'), "checking with the string, should be in state 'c' in [default]");
  
  ok(nested.isInState(nested.f, 'other'), "checking with the string, should be in state 'f' in [other]");
  ok(nested.isInState('f', 'other'), "checking with the string, should be in state 'f' in [other]");
});


