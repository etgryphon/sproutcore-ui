//----------------------------------------------------------------------------
// SCUI.CascadingComboView TEST
//----------------------------------------------------------------------------

// Setup the test pane
var pane = SC.ControlTestPane.design({

  layout: { right: 5, width: 400, top: 65, bottom: 5 }

}).add("CascadingComboView", SCUI.CascadingComboView, {
  
  layout: { height: 200 },
   masterLabel: "Master Label",
   detailLabel: "Detail Label"
});

pane.show();
window.pane = pane;

// TESTS

module("CascadingComboView", pane.standardSetup());

test("Render Test && Elements", function() {
  var view = pane.view('CascadingComboView');
  ok(view, "View Rendered");
  equals(view.$('div > .sc-label-view').get(0).innerHTML, "Setup did not meet requirements.","When setup is incorrect the view will only contain a label telling us that this is the case.");
  
});

