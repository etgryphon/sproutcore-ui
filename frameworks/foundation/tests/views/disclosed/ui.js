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
  var container = view.get('_container');
  var content = container.get('contentView');
  var expanded = view.get('_contentView');
  var nowshowing = container.get('nowShowing');
  ok(!view._isCollapsed, 'State is Expanded');
  equals(nowshowing, expanded, 'nowShowing is the contentView');
  ok(content, 'contentView is not null');
  equals(content, expanded, 'Expanded is the contentView');
});

test('Toggling', function(){
  var view = pane.view('Expanded');
  var container = view.get('_container');
  var expanded, collapsed;
  // Collapse Action Test (toggle)
  view.collapse();
  var content = container.get('contentView');
  var nowShowing = container.get('nowShowing');
  expanded = view.get('_contentView');
  collapsed = view.get('_collapsedView');
  
  ok(!view.isOpen,"State is collapsed after first toggle.");
  equals(nowShowing, collapsed, "Container's nowShowing is the collapsedView.");
  ok(content,"Container view's contentView is not null.");
  equals(content, collapsed, "Container's contentView is the collapsedView.");
  // Expand Action Test (toggle)
  view.expand();
  content = container.get('contentView');
  nowShowing = container.get('nowShowing');
  expanded = view.get('_contentView');
  collapsed = view.get('_collapsedView');
  
  ok(view.isOpen,"State is Expanded after second toggle.");
  equals(nowShowing, expanded, "Container's nowShowing is the expanded contentView.");
  ok(content,"Container view's contentView is not null.");
  equals(content, expanded, "Container's contentView is the expanded contentView.");
});