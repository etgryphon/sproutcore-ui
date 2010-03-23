

(function() {
SC.BUNDLE_INFO = {};
var basic = SC.View.extend({

});


var pane = SC.ControlTestPane.design()
  .add("basic", basic, { 
  });

pane.show(); // add a test to show the test pane

// ..........................................................
// TEST VIEWS
// 
module('SCUI.LoadingSpinnerView ui', pane.standardSetup());

test("basic", function() {
  var spinner = SCUI.LoadingSpinnerView.create({

  });
  
  spinner.appendTo(pane.view('basic'));
  var view = pane.view('basic').get('childViews')[0];
  ok(view.get('isVisibleInWindow'), 'should be visible in window');
});

test("notVisible", function(){
  pane.view('basic').createChildView(SCUI.LoadingSpinnerView.design({
    
  }));
  var view = pane.view('basic').get('childViews')[0];
  ok(!view.get('isVisibleInWindow'), 'should NOT be visible in window');
});
}());