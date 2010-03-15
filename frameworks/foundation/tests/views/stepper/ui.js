(function() {
  
var nowrap = SC.View.extend({
  createChildViews: function() {
    var childViews = [];

    var stepper = this.createChildView(SCUI.StepperView.design({
      valueWraps: YES,
      max: 10
    }));
    childViews.push(stepper);

    var view = this.createChildView(SC.TextFieldView.design({
      layout: { top: 0, left: 30, width: 25, height: 40 },
      valueBinding: SC.binding('.value', stepper)
    }));
    childViews.push(view);

    this.set('childViews', childViews);
  }
});

var wraps = SC.View.extend({
  createChildViews: function() {
    var childViews = [];

    var stepper = this.createChildView(SCUI.StepperView.design({
      valueWraps: YES,
      max: 10,
      min: 0
    }));
    childViews.push(stepper);

    var view = this.createChildView(SC.TextFieldView.design({
      layout: { top: 0, left: 30, width: 25, height: 40 },
      valueBinding: SC.binding('.value', stepper)
    }));
    childViews.push(view);

    this.set('childViews', childViews);
  }
});
  
var pane = SC.ControlTestPane.design()
  .add("basic", nowrap, { 
  })
  .add("wraps", wraps, { 
  })
  .add("disabled", SCUI.StepperView, { 
    isEnabled: NO
  });

pane.show(); // add a test to show the test pane

// ..........................................................
// TEST VIEWS
// 
module('SCUI.StepperView ui', pane.standardSetup());

test("basic", function() {
  var view = pane.view('basic');
  var stepper = view.get('childViews')[0];
  ok(!stepper.$().hasClass('disabled'), 'should not have disabled class');
  ok(!stepper.$().hasClass('sel'), 'should not have sel class');
});

test("disabled", function() {
  var view = pane.view('disabled');
  ok(view.$().hasClass('disabled'), 'should have disabled class');
  ok(!view.$().hasClass('sel'), 'should not have sel class');
});
})();

