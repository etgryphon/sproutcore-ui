// ========================================================================
// SCUI.DrawingView Tests
// ========================================================================

/* Test SCUI.DrawingView */

var pane = SC.ControlTestPane.design()
  .add("basic,shapes", SCUI.DrawingView, {
    layout: {width: 350, height: 400}, // This normally handled by Dashboard...
    shapes: [
      {
        shape: SCUI.LINE,
        start: {x: 0, y: 0},
        end: {x: 100, y: 100},
        type: SCUI.STROKE
      },
      {
        shape: SCUI.RECT,
        start: {x: 0, y: 0},
        size: {width: 100, height: 100},
        type: SCUI.STROKE
      },
      {
        shape: SCUI.CIRCLE,
        center: {x: 0, y: 0},
        radius: 20,
        type: SCUI.STROKE
      },
      {
        shape: SCUI.POLY,
        path: [
          {x: 0, y: 0},
          {x: 10, y: 10},
          {x: 0, y: 50},
          {x: 30, y: 150}
        ],
        type: SCUI.STROKE
      }
    ]
  });  
  
pane.show(); // add a test to show the test pane
window.pane = pane ;

// ..........................................................
// BASIC TESTS
// 
module("Basic Tests", pane.standardSetup());

test("init basic,shapes", function() {
  var view = pane.view('basic,shapes');
});
