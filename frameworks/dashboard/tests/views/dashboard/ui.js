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

test("Widget has a widget container", function() {
  var childView, position;
  var view = pane.view('basic');
  var content = [
    SC.Object.create( SCUI.Widget, { name: 'widget 1' })
  ];
  
  SC.RunLoop.begin();
  view.set('content', content);
  SC.RunLoop.end();

  childView = view.childViews[0];
  ok(childView.kindOf(SCUI.WidgetContainerView), "Child view is SCUI.WidgetContainerView");
  ok(childView.get('content') === content[0], "WidgetView content is the widget object");
  
});

