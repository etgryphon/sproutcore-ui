// ==========================================================================
// SCUI.Resizable Unit Test
// ==========================================================================
/**
  @author Brandon Blatnick
*/

var basic = 
SC.View.design({
  layout: { left: 0, height: 100, width: 100 },
  backgroundColor: 'blue',
  childViews: 'thumb'.w(),
  thumb: SC.View.design(SCUI.Resizable, {
    layout: {bottom: 0, right: 0, height: 25, width: 25},
    backgroundColor: 'red'
  })
});

var palette = 
SC.PalettePane.create({
  layout: { left: 0, height: 100, width: 100 },
  contentView: SC.View.extend({
    backgroundColor: 'blue',
    childViews: 'thumb'.w(),
    thumb: SC.View.design(SCUI.Resizable, {
      layout: {bottom: 0, right: 0, height: 25, width: 25},
      backgroundColor: 'red',
      viewToResizeBinding: SC.Binding.oneWay('.parentView.parentView') 
    })
  })
});

var pane = SC.ControlTestPane.design()
.add("basic", basic);
      
pane.show(); // add a test to show the test pane
window.pane = pane ;
palette.append();

// ..........................................................
// TEST CASES
// 
module("SCUI.Resizable", pane.standardSetup());

test("Check basic visibility", function() {
  ok(pane.view('basic').get('isVisibleInWindow'), 'basic.isVisibleInWindow should be YES');
});


