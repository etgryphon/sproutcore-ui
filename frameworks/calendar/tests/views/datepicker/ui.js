// ========================================================================
// SCUI.DatePickerView Tests
// ========================================================================


/* Test SCUI.CalendarView */

var pane = SC.ControlTestPane.design()
  .add("basic", SCUI.DatePickerView, {
    layout: {width: 175, height: 25}
  })
  .add("textfield disabled", SCUI.DatePickerView, {
    layout: {width: 175, height: 25},
    isTextFieldEnabled: NO
  })
  .add("datepicker disabled, textfield disabled", SCUI.DatePickerView, {
    layout: {width: 175, height: 25},
    isTextFieldEnabled: NO,
    isEnabled: NO
  });
  
pane.show(); // add a test to show the test pane
window.pane = pane ;

// ..........................................................
// BASIC TESTS
// 
module("Basic Tests", pane.standardSetup());

test("textfield enabled, test if it's enabled by default", function() {
  var view = pane.view("basic");
  var textfield = view.getPath("childViews.0");
  equals(textfield.get('isEnabled'), YES, 'textfield should be enabled by default');
});

test("textfield enabled, test isEnabled binding", function() {
  var view = pane.view("basic");
  SC.RunLoop.begin();
  view.set('isEnabled', NO);
  SC.RunLoop.end();
  var textfield = view.getPath("childViews.0");
  equals(textfield.get('isEnabled'), NO, 'textfield should be disabled when basic datepicker is disabled');
});

test("textfield disabled, test if it's really disabled", function() {
  var textfield = pane.view("textfield disabled").getPath("childViews.0");
  equals(textfield.get('isEnabled'), NO, 'textfield should be really disabled');
});

test("textfield disabled, check that it doesn't change when enabling the datepicker", function() {
  var view = pane.view("datepicker disabled, textfield disabled");
  var textfield = view.getPath("childViews.0");
  SC.RunLoop.begin();
  view.set('isEnabled', YES);
  SC.RunLoop.end();
  equals(textfield.get('isEnabled'), NO, 'textfield should be really disabled');
});
