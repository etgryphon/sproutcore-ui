// ==========================================================================
// SCUI.ToolTip Unit Test
// ==========================================================================
/**
  @author Josh Holt
*/
var pane = SC.ControlTestPane.design({

  layout: { right: 5, width: 400, top: 65, bottom: 5 }

}).add("Non Image with tooltip", SC.View, {
  
  layout: { height: 200 },
  childViews: [
    SC.LabelView.design(SCUI.ToolTip,{
      layout: {centerY:0, centerX: 0, height: 24, width: 200 },
      toolTip: "This is a test tooltip",
      value: "This label has a tool tip"
    })
  ]
}).add("Image with tooltip", SC.View, {

  layout: { height: 200 },
  childViews: [
    SC.ImageView.design(SCUI.ToolTip,{
      isImage: YES,
      layout: {centerY:0, centerX: 0, height: 32, width: 32 },
      toolTip: "This is a test tooltip",
      value: "",
      backgroundColor: '#576076'
    })
  ]
});

pane.show();
window.pane = pane;

// TESTS
module("SCUI.ToolTip Mixin", pane.standardSetup());

test("A Non Image View should only use the title attribute for the tooltip",function(){
  var view = pane.view('Non Image with tooltip');
  ok(view.$('div'), 'Non Image with tooltip rendered successfully');
  ok(view.$('div').get(0).title, "Non Image with tooltip has title attribute");
  ok(view.$('div').get(0).alt === undefined, "Non Image with tooltip does not have the alt attribute");
  equals(view.$('div').get(0).title, 'This is a test tooltip', "Tooltip text matches for title attribute");
});

test("An Image View should use the title & alt attributes for the tooltip",function(){
  var view = pane.view('Image with tooltip');
  ok(view.$('img'), 'Image with tooltip rendered successfully');
  ok(view.$('img').get(0).title, "Image with tooltip has title attribute");
  ok(view.$('img').get(0).alt, "Image with tooltip has alt attribute");
  equals(view.$('img').get(0).title, 'This is a test tooltip', "Tooltip text matches for title attribute");
  equals(view.$('img').get(0).alt, 'This is a test tooltip', "Tooltip text matches for alt attribute");
});
