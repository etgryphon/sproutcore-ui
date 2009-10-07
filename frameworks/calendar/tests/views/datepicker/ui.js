// ========================================================================
// SCUI.DatePickerView Tests
// ========================================================================


/* Test SCUI.CalendarView */

var pane = SC.ControlTestPane.design()
  .add("basic", SCUI.DatePickerView, {
    layout: {width: 175, height: 25}
  });
  
pane.show(); // add a test to show the test pane
window.pane = pane ;

// ..........................................................
// BASIC TESTS
// 
module("Basic Tests", pane.standardSetup());