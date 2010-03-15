// ==========================================================================
// SCUI.SnapLines Unit Test
// ==========================================================================
/**
  @author Mike Ball
*/
// ..........................................................
// TEST CASES
//
var view, view2, pane;
module('SCUI.SnapLines ui',{
  
  setup: function() {
    pane = SC.MainPane.create() ;
    view = SC.View.create( SCUI.SnapLines, {
      layout: { height: 300, width: 200 },
      childViews: [SC.View.design({
        layout: {top: 0, left: 0, width: 25, height: 25}
      }),
      SC.View.design({
        layout: {top: 100, left: 0, width: 25, height: 25}
      })]
    });
    view2 = SC.View.create( SCUI.SnapLines, {
      layout: { left: 400, height: 300, width: 200 },
      childViews: [SC.View.design({
        layout: {top: 0, left: 0, width: 25, height: 25}
      }),
      SC.View.design({
        layout: {top: 100, left: 0, width: 25, height: 25}
      })]
    });
    SC.RunLoop.begin();
    pane.appendChild(view2);
    pane.appendChild(view);
    pane.append() ;
    SC.RunLoop.end();

  },
  
  teardown: function() {
    view = null ;
    pane.remove() ;
    pane = null ;
  }
  
});

test("Check values inserted into position hashes", function() {
  ok(view.get('isVisibleInWindow'), "should be visible");
  ok(view.get('hasSnapLines'), "should have snap lines mixin");
  ok(view.get('childViews').length, 2, "should have 2 children");
  view.setupData();
  ok(view._xPositions, "xPositions has should exist");
  ok(view._yPositions, "yPositions has should exist");
  //assuming 5 snap/2
  equals(view._xPositions[0].length, 3, "should have 3 items at x:0");
  equals(view._xPositions[2].length, 2, "should have 2 items at x:25");
  equals(view._yPositions[0].length, 2, "should have 2 items at y:0");
  equals(view._yPositions[10].length, 1, "should have 1 items at y:100");
});

test("Ignore values works", function() {
  ok(view2.get('isVisibleInWindow'), "should be visible");
  ok(view2.get('hasSnapLines'), "should have snap lines mixin");
  ok(view2.get('childViews').length, 2, "should have 2 children");
  view2.setupData([view2.getPath('childViews.0')]);
  ok(view2._xPositions, "xPositions has should exist");
  ok(view2._yPositions, "yPositions has should exist");
  //assuming 5 snap/2
  equals(view2._xPositions[40].length, 2, "should have 2 items at x:400");
  equals(view2._xPositions[42].length, 1, "should have 1 items at x:245");
  equals(view2._yPositions[0].length, 1, "should have 1 items at y:0");
  equals(view2._yPositions[10].length, 1, "should have 1 items at y:100");
});

