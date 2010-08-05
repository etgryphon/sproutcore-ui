// ========================================================================
// SCUI.CalendarView Tests
// ========================================================================


/* Test SCUI.CalendarView */

var pane = SC.ControlTestPane.design()
  .add("basic,small", SCUI.CalendarView, {
    layout: {width: 305, height: 298},
    dateSize: {width: 30, height: 30},
    dateBorderWidth: 0
  })
  .add("basic,small,selected", SCUI.CalendarView, {
    layout: {width: 305, height: 298},
    dateSize: {width: 30, height: 30},
    selectedDate: SC.DateTime.create(),
    monthStartOn: SC.DateTime.create()
  });
  
  
pane.show(); // add a test to show the test pane
window.pane = pane ;

// ..........................................................
// BASIC TESTS
// 
module("Basic Tests", pane.standardSetup());

test("init basic,small for proper start on date", function() {
  var view = pane.view('basic,small');
  var day = view.get('monthStartOn').get('day');
  equals(day, 1, 'basic,small start on date is the 1st');
});

test("basic,small,selected selected date shows up", function() {
  var view = pane.view('basic,small,selected');
  ok(view.$('.selected').get(0), 'basic,small,selected has a selected date');
});
