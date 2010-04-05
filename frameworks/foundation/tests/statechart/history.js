// ==========================================================================
// SCUI.Statechart Unit Test
// ==========================================================================
/**
  @author Evin Grano
*/
var nested, exitTotal, enterTotal;

// ..........................................................
// CONTENT CHANGING
// 

module("SCUI.Statechart Mixin History Statechart", {
  setup: function() {
    enterTotal = exitTotal = 0;
    nested = SC.Object.create(SCUI.Statechart,{
      startStates: {'default': 'b'},
      startOnInit: YES,
      
      a: SCUI.Statechart.registerState({enterState: function(){ enterTotal+=1; }, exitState: function(){ exitTotal+=1; }}),
      b: SCUI.Statechart.registerState({initialSubState: 'c', enterState: function(){ enterTotal+=1; }, exitState: function(){ exitTotal+=1; }}),
      c: SCUI.Statechart.registerState({initialSubState: 'f', parentState: 'b', enterState: function(){ enterTotal+=1; }, exitState: function(){ exitTotal+=1; }}),
      d: SCUI.Statechart.registerState({parentState: 'b', enterState: function(){ enterTotal+=1; }, exitState: function(){ exitTotal+=1; }}),
      e: SCUI.Statechart.registerState({enterState: function(){ enterTotal+=1; }, exitState: function(){ exitTotal+=1; }}),
      f: SCUI.Statechart.registerState({parentState: 'c', enterState: function(){ enterTotal+=1; }, exitState: function(){ exitTotal+=1; }}),
      g: SCUI.Statechart.registerState({parentState: 'c', enterState: function(){ enterTotal+=1; }, exitState: function(){ exitTotal+=1; }})
    
    });
  },
  
  teardown: function() {
    nested.destroy();
    enterTotal = exitTotal = 0;
  }
});

test("nested state initialization", function() {
  equals(nested.get('f'), nested.get('f').state(), "f state should be the current state for default statechart");
});

test("history state transition", function() {
  var f = nested.get('f');
  equals(nested.get('f').state(), f, "f state should be the current state for default statechart");
  
  f.goState('d');
  equals(nested.get('d').state(), nested.get('d'), "d state should be the current state for default statechart");
  enterTotal = exitTotal = 0;
  var d = nested.get('d');
  d.goHistoryState('c');
  equals(nested.get('f').state(), f, "f state should be the current state for default statechart after going to the history of c");
  equals(enterTotal, 2, "should have entered 2 state after transition");
  equals(exitTotal, 1, "should have exited 1 states after transition");

});

test("Recursive history state transition", function() {
  var f = nested.get('f');
  equals(nested.get('f').state(), f, "f state should be the current state for default statechart");
  
  f.goState('e');
  equals(nested.get('e').state(), nested.get('e'), "e state should be the current state for default statechart");
  enterTotal = exitTotal = 0;
  f.goHistoryState('b', YES);
  equals(nested.get('f').state(), f, "f state should be the current state for default statechart after going to the history of c");
  equals(enterTotal, 3, "should have entered 2 state after transition");
  equals(exitTotal, 1, "should have exited 1 states after transition");

});



