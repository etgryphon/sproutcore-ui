// ..........................................................
// SCUI.LoadingSpinnerView
// 


var pane = SC.ControlTestPane.design()
  .add("basic", SCUI.LoadingSpinnerView, { 
    isPlaying: true
  });

pane.show(); // add a test to show the test pane

// ..........................................................
// TEST VIEWS
// 
module('SCUI.LoadingSpinnerView ui', pane.standardSetup());

test("basic", function() {
  var view = pane.view('basic');
  view.animate();
  ok(view.get('isVisibleInWindow'), 'should be visible in window');
});

