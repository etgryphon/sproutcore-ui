// ========================================================================
// SCUI.ColorPicker Tests
// ========================================================================


/*global module test htmlbody ok equals same stop start */


htmlbody('<style> .sc-static-layout { border: 1px red dotted; } </style>');

(function() {  
  var pane = SC.ControlTestPane.design()
    
    .add("colorPicker", SCUI.ColorPicker, { 
      
    });
    
  pane.show(); // add a test to show the test pane

  // ..........................................................
  // TEST VIEWS
  // 
  module('SCUI.ColorPicker ui', pane.standardSetup());
  
  test("Check that all tabViews are visible", function() {
    ok(pane.view('colorPicker').get('isVisibleInWindow'), 'tabView1.isVisibleInWindow should be YES');

   });

})();

