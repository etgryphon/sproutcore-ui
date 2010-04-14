// ========================================================================
// SCUI.ColorPicker Tests
// ========================================================================


/*global module test htmlbody ok equals same stop start */


htmlbody('<style> .sc-static-layout { border: 1px red dotted; } </style>');

(function() {  
  var pane = SC.ControlTestPane.design()
    
    .add("colorPicker", SCUI.ColorPicker, { 
      layout: {width: 300, height: 300}
    });
    
  pane.show(); // add a test to show the test pane

  // ..........................................................
  // TEST VIEWS
  // 
  module('SCUI.ColorPicker ui', pane.standardSetup());
  
  test("Check that all color pickers are visible", function() {
    ok(pane.view('colorPicker').get('isVisibleInWindow'), 'color picker should be visible');
   });
   
  test("Can set color value poperty", function() {
    var view = pane.view('colorPicker');
    equals(view.get('value'), "#eee", "should have default color value");
    SC.RunLoop.begin();
    view.set('value', "#000");
    SC.RunLoop.end();
    equals(view.get('value'), "#000", "should have default color value");
    equals(view.$('input').get(0).value, "#000", "text field should have value");
  });

})();

