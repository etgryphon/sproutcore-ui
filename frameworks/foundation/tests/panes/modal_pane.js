// ==========================================================================
// SCUI.Resizable Unit Test
// ==========================================================================
/**
  @author Brandon Blatnick
*/
sc_require('core');

var picker = 
SCUI.ModalPane.create({
  layout: { centerX: 0, centerY: 0, height: 200, width: 300 },
  // maxHeight: 150,
  // maxWidth: 200,
  // minHeight: 50,
  // minWidth: 75,
  title: 'My Test Modal',
  titleIcon: 'title-icon',
  contentView: SC.View.design({
    backgroundColor: 'blue',
    childViews: 'view'.w(),
    view: SC.View.design({
      backgroundColor: 'orange',
      mouseDown: function() {
        var view = SC.View.create({
          backgroundColor: 'gray'
        });
        
        picker.set('contentView', view);
      }
    })
  })
});
var pane = SC.ControlTestPane.design();
      
pane.show(); // add a test to show the test pane
window.pane = pane ;

// ..........................................................
// TEST CASES
// 
module("SCUI.ModalPane", pane.standardSetup());

test("Check basic visibility", function() {
  picker.append();
});


