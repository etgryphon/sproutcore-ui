// ========================================================================
// SCUI.ColorWell Tests
// ========================================================================


/*global module test htmlbody ok equals same stop start */


htmlbody('<style> .sc-static-layout { border: 1px red dotted; } </style>');

(function() {  
  var pane = SC.ControlTestPane.design()
    
    .add("well1", SCUI.ColorWell, { 
      value: '#eee',
      layout: {width: 44, height: 23}
    });
    
  pane.show(); // add a test to show the test pane

  // ..........................................................
  // TEST VIEWS
  // 
  module('SCUI.ColorWell ui', pane.standardSetup());
  
  test("Check that all color wells are visible", function() {
    ok(pane.view('well1').get('isVisibleInWindow'), 'color picker should be visible');
   });
   
  test("Can set color value poperty", function() {
    var view = pane.view('well1');
    equals(view.get('value'), "#eee", "should have default color value");
    SC.RunLoop.begin();
    view.set('value', "#000");
    SC.RunLoop.end();
    equals(view.get('value'), "#000", "should have default color value");
  });

})();

