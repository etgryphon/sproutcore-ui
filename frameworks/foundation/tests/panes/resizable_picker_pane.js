// ==========================================================================
// SCUI.Resizable Unit Test
// ==========================================================================
/**
  @author Brandon Blatnick
*/
sc_require('core');

var picker = 
SCUI.ResizablePickerPane.create({
  layout: { left: 0, height: 100, width: 100 },
  maxHeight: 150,
  maxWidth: 200,
  minHeight: 50,
  minWidth: 75,
  contentView: SC.View.extend({
    backgroundColor: 'blue',
    childViews: 'view'.w(),
    view: SC.View.design({
      layout: {bottom: 0, right: 0, left: 0, top: 0},
      backgroundColor: 'blue'
    })
  })
});
var pane = SC.ControlTestPane.design();
      
pane.show(); // add a test to show the test pane
window.pane = pane ;

// ..........................................................
// TEST CASES
// 
module("SCUI.ResizablePickerPane", pane.standardSetup());

test("Check basic visibility", function() {
  picker.popup(pane._pane, SC.PICKER_POINTER);
});


