// ========================================================================
// SCUI.DrawingView Tests
// ========================================================================

/* Test SCUI.DrawingView */

var pane = SC.ControlTestPane.design()
  .add("basic,shapes,stroke", SCUI.DrawingView, {
    layout: {width: 350, height: 200}, // This normally handled by Dashboard...
    shapes: [
      {
        shape: SCUI.LINE,
        start: {x: 10, y: 10},
        end: {x: 100, y: 100},
        style: {
          width: 5,
          color: 'orange'
        }
      },
      {
        shape: SCUI.RECT,
        start: {x: 125, y: 10},
        size: {width: 100, height: 100},
        type: SCUI.STROKE,
        style: {
          width: 3,
          color: '#FFA500',
          transparency: 0.5
        }
      },
      {
        shape: SCUI.CIRCLE,
        center: {x: 75, y: 150},
        radius: 20,
        type: SCUI.STROKE,
        style: {
          width: 10,
          color: 'rgb(255,165,0)',
          transparency: 0.2
        }
      },
      {
        shape: SCUI.POLY,
        path: [
          {x: 125, y: 150},
          {x: 150, y: 175},
          {x: 200, y: 150},
          {x: 180, y: 190}
        ],
        type: SCUI.STROKE,
        style: {
          width: 2,
          color: 'rgba(255,165,0,0.7)'
        }
      }
    ]
  })
  .add("basic,shapes,fill", SCUI.DrawingView, {
    layout: {width: 350, height: 200}, // This normally handled by Dashboard...
    shapes: [
      {
        shape: SCUI.LINE,
        start: {x: 10, y: 10},
        end: {x: 100, y: 100},
        style: {
          color: 'orange'
        }
      },
      {
        shape: SCUI.RECT,
        start: {x: 125, y: 10},
        size: {width: 100, height: 100},
        type: SCUI.FILL,
        style: {
          color: '#FFA500',
          transparency: 0.5
        }
      },
      {
        shape: SCUI.CIRCLE,
        center: {x: 75, y: 150},
        radius: 20,
        type: SCUI.FILL,
        style: {
          color: 'rgb(255,165,0)',
          transparency: 0.2
        }
      },
      {
        shape: SCUI.POLY,
        path: [
          {x: 125, y: 150},
          {x: 150, y: 175},
          {x: 200, y: 150},
          {x: 180, y: 190}
        ],
        type: SCUI.FILL,
        style: {
          color: 'rgba(255,165,0,0.7)'
        }
      }
    ]
  });
  
pane.show(); // add a test to show the test pane
window.pane = pane ;

// ..........................................................
// BASIC TESTS
// 
module("Basic Tests", pane.standardSetup());

test("init basic,shapes,stroke", function() {
  var view = pane.view('basic,shapes,stroke');
});

test("init basic,shapes,fill", function() {
  var view = pane.view('basic,shapes,fill');
});

