// ========================================================================
// SCUI.CollapsibleView Tests
// ========================================================================


/* Test SCUI.CollapsibleView */

var pane = SC.ControlTestPane.design()
  .add("basic_internal", SCUI.CollapsibleView, {
    layout: {height: 50, width: 100},
    expandedView: SC.LabelView.design({
      layout: {height: 50, width: 100},
      escapeHTML: NO,
      value: '<p>Expanded!</p>'
    }),
    collapsedView: SC.LabelView.design({
      layout: {height: 25, width: 100},
      escapeHTML: NO,
      value: '<p>Collapsed!</p>'
    })
  });
  
  
pane.show(); // add a test to show the test pane
window.pane = pane ;

// ..........................................................
// BASIC TESTS
// 
module("Basic Tests", pane.standardSetup());

test("init expanded internal view rendered", function() {
  var view = pane.view('basic_internal');
  var content = view.get('contentView');
  var ev = view._expandedView;
  var ns = view.get('nowShowing');
  ok(!view._isCollapsed, 'Internal State is Expanded');
  equals(ns, ev, 'nowShowing is the expandedView');
  ok(content, 'contentView is not null');
  equals(content, ev, 'contentView is the expandedView');
});

test("Test collapse()/expand()...", function() {
  var view = pane.view('basic_internal');
  view.collapse();
  var content = view.get('contentView');
  var cv = view._collapsedView;
  var ns = view.get('nowShowing');
  ok(view._isCollapsed, 'Internal State is Collapsed after collapse()');
  equals(ns, cv, 'nowShowing is the collapsedView');
  ok(content, 'contentView is not null');
  equals(content, cv, 'contentView is the collapsedView');
  // Check the expanded action
  view.expand();
  var ev = view._expandedView;
  content = view.get('contentView');
  ns = view.get('nowShowing');
  ok(!view._isCollapsed, 'Internal State is Expanded after expand()');
  equals(ns, ev, 'nowShowing is the expandedView');
  ok(content, 'contentView is not null');
  equals(content, ev, 'contentView is the expandedView');
});

test("Test toggle()...", function() {
  var view = pane.view('basic_internal');
  var ev = view._expandedView;
  var cv = view._collapsedView;
  // First, Test that the view is the expanded view
  var ns = view.get('nowShowing');
  var content = view.get('contentView');
  ok(!view._isCollapsed, 'Initial State is Expanded');
  equals(ns, ev, 'nowShowing is the expandedView');
  ok(content, 'contentView is not null');
  equals(content, ev, 'contentView is the expandedView');
  // Second, call toggle and make sure it is the collapsed view
  view.toggle();
  ns = view.get('nowShowing');
  content = view.get('contentView');
  ok(view._isCollapsed, 'Internal State is now collapsed after toggle()');
  equals(ns, cv, 'nowShowing is the collapsedView');
  ok(content, 'contentView is not null');
  equals(content, cv, 'contentView is the collapsedView');
  // Third, do toggle again and return to the expanded state
  view.toggle();
  ns = view.get('nowShowing');
  content = view.get('contentView');
  ok(!view._isCollapsed, 'Internal State is expanded after toggle()');
  equals(ns, ev, 'nowShowing is the expandedView');
  ok(content, 'contentView is not null');
  equals(content, ev, 'contentView is the expandedView');
});

test("Test ExpandedView Did Change", function() {
  var view = pane.view('basic_internal');
  var newView = SC.LabelView.design({
    layout: {height: 50, width: 100},
    escapeHTML: NO,
    value: '<p>New Expanded!</p>'
  });
  var oldEV = view._expandedView;
  view.set('expandedView', newView);
  var content = view.get('contentView');
  var ev = view._expandedView;
  var ns = view.get('nowShowing');
  ok(!view._isCollapsed, 'Internal State is Expanded');
  equals(ns, ev, 'nowShowing is the expandedView');
  ok(content, 'contentView is not null');
  equals(content, ev, 'contentView is the expandedView');
  ok(!(ev === oldEV), 'new expandedView is different from old expandedView');
});

test("Test CollapsedView Did Change", function() {
  var view = pane.view('basic_internal');
  view.collapse();
  var newView = SC.LabelView.design({
    layout: {height: 50, width: 100},
    escapeHTML: NO,
    value: '<p>New Collapsed!</p>'
  });
  var oldCV = view._collapsedView;
  view.set('collapsedView', newView);
  var content = view.get('contentView');
  var cv = view._collapsedView;
  var ns = view.get('nowShowing');
  ok(view._isCollapsed, 'Internal State is Collapsed');
  equals(ns, cv, 'nowShowing is the collapsedView');
  ok(content, 'contentView is not null');
  equals(content, cv, 'contentView is the collapsedView');
  ok(!(cv === oldCV), 'new collapsedView is different from old collapsedView');
});


