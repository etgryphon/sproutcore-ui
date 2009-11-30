// ========================================================================
// SCUI.DashboardView Tests
// ========================================================================

var pane = SC.ControlTestPane.design()
  .add('basic', SCUI.DashboardView, {
  });
  
pane.show();
window.pane = pane;

module("Dashboard View Tests", pane.standardSetup({
  layout: { width: 230 }
}));

test("Default dashboard delegate is the view itself", function() {
  var view = pane.view('basic');
  var del = view.get('dashboardDelegate');
  ok(del === view, "View is the delegate");
});

test("Default widget view is WidgetMissingView", function() {
  var childView, position;
  var view = pane.view('basic');
  var content = [
    SC.Object.create({ name: 'widget 1' })
  ];
  
  SC.RunLoop.begin();
  view.set('content', content);
  SC.RunLoop.end();
  
  childView = view.childViews[0];
  ok(childView.kindOf(SCUI.WidgetMissingView), "Child view is SCUI.WidgetMissinView");
  ok(childView.get('content') === content[0], "Child view content is dashboard content");
  
  position = childView.get('content').get('position');
  ok(position, "Widget has been assigned a default position");
  
});