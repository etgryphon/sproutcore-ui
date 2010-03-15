var pane = SC.ControlTestPane.design({

  layout: { right: 5, width: 250, top: 65, bottom: 5 }

}).add("ComboBoxView", SCUI.ComboBoxView_Old, {
  
  layout: { top: 5, left: 5, right: 5, height: 22 }

});

pane.show();
window.pane = pane;

// TESTS

module("ComboBoxView", pane.standardSetup());

test("Click on drop-down button shows autosuggest pane.", function() {
  var view = pane.view('ComboBoxView');
  var buttonView = view.get('_dropDownButtonView');
  buttonView.mouseDown();
  buttonView.mouseUp();
  
});

