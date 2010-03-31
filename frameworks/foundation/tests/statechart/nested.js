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
    nested = SC.Object.create(SCUI.Statechart,{
      startStates: {'default': 'a', 'other': 'f'},
      startOnInit: YES,
      
      a: SCUI.Statechart.registerState({initialSubState: 'b'}),
      b: SCUI.Statechart.registerState({parentState: 'a', initialSubState: 'c'}),
      c: SCUI.Statechart.registerState({parentState: 'b'}),
      d: SCUI.Statechart.registerState({parentState: 'b'}),
      e: SCUI.Statechart.registerState({}),
      f: SCUI.Statechart.registerState({parallelStatechart:'other'}),
      g: SCUI.Statechart.registerState({parallelStatechart:'other'})
      
    
    });
  },
  
  teardown: function() {
    nested.destroy();
  }
});

test("nested state initialization", function() {
  equals(nested.get('c'), nested.get('c').state(), "c state should be the current state for default statechart");
  equals(nested.get('f'), nested.get('f').state(), "f state should be the current state for other statechart");
});

test("nested state transition", function() {
  var c = nested.get('c');
  equals(c, c.state(), "c state should be the current state for default statechart");
  c.goState('e');
  
  equals(nested.get('e'), nested.get('e').state(), "e state should be the current state for other statechart");
});


