// ========================================================================
// SCUI.DiscolsedView Tests
// ========================================================================


/* Test SCUI.DiscolsedView */


var pane = SC.ControlTestPane.design()
  .add("Expanded", SCUI.DisclosedView, {
    layout: {top:0, right: 0, left:0, height:100},
    title: 'Test Titlebar',
    contentView: SC.LabelView.design({
      layout: {top:0, right: 0, left:0, bottom:0},
      escapeHTML: NO,
      value: '<p>test content</p>'
    })
  });
  
  
pane.show(); // add a test to show the test pane
window.pane = pane;



// ..........................................................
// BASIC TESTS
// 
module("SCUI#DisclosedView Tests", pane.standardSetup());

test("init expanded", function() {
  var view = pane.view('Expanded');
  ok(view, 'View Rendered');
  equals(view.isOpen, true, 'View should render Expanded');
});

test('Toggling', function(){
  var view = pane.view('Expanded');
  // Collapse Action Test (toggle)
  view.toggle(NO);
  ok(!view.isOpen,"State is collapsed after first toggle.");
  // Expand Action Test (toggle)
  view.toggle(YES);
  ok(view.isOpen,"State is Expanded after second toggle.");
});

