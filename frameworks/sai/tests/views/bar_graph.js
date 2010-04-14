// ========================================================================
// SCUI.BarGraph Tests
// ========================================================================


/*global module test htmlbody ok equals same stop start */


htmlbody('<style> .sc-static-layout { border: 1px red dotted; } </style>');

(function() {  
  var pane = SC.ControlTestPane.design()
    
    .add("bar", SCUI.BarGraph, { 
      layout: {width: 300, height: 300},
      content: [55, 20, 13, 32, 5, 1, 2, 10]
    });
    
  pane.show(); // add a test to show the test pane

  // ..........................................................
  // TEST VIEWS
  // 
  module('SCUI.BarGraph ui', pane.standardSetup());
  
  test("Check that all bar graphas are visible", function() {
    ok(pane.view('bar').get('isVisibleInWindow'), 'bar graph should be visible');
   });
})();

