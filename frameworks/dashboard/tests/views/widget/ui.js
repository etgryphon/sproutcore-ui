// ========================================================================
// SCUI.WidgetView Tests
// ========================================================================


/* Test SCUI.WidgetView */

SCUI.WidgetTestExampleView = SC.View.extend({
  layout: {width: 250, height: 200},
  content: null,
  render: function(context, firstTime){
    var c = this.get('content');
    var name = 'No Name', box1 = 'Error', box2 = 'Error';
    if (c){
      name = c.get('name');
      box1 = c.get('box1');
      box2 = c.get('box2');
    }
    context = context.begin('div').addClass('inner-widget').text(name).end();
    context = context.begin('div').addClass('box-one').text(box1).end();
    context = context.begin('div').addClass('box-two').text(box2).end();
  }
});

SCUI.WidgetTestWebView = SC.View.extend({
  content: null,
  render: function(context, firstTime){
    var c = this.get('content');
    context = context.begin('iframe').attr({'width': '300', 'height': '200', 'src': c.get('value')}).end();
  }
});


var pane = SC.ControlTestPane.design()
  .add("basic", SCUI.WidgetView, {
    layout: {width: 350, height: 250}, // This normally handled by Dashboard...
    exampleView: SCUI.WidgetTestExampleView,
    nameKey: 'name',
    sizeKey: 'size',
    content: SC.Object.create({
      name: 'Test Title: Basic',
      box1: 'Box One Text',
      box2: 'Box Two Text'
    })
  })
  .add("basic_web", SCUI.WidgetView, {
    layout: {width: 350, height: 250}, // This normally handled by Dashboard...
    exampleView: SCUI.WidgetTestWebView,
    nameKey: 'name',
    sizeKey: 'size',
    content: SC.Object.create({
      name: 'Test Title: Web',
      size: {width: 300, height: 200},
      value: 'http://www.google.com'
    })
  });
  
  
pane.show(); // add a test to show the test pane
window.pane = pane ;

// ..........................................................
// BASIC TESTS
// 
module("Basic Tests", pane.standardSetup());

test("init", function() {
  var view = pane.view('basic');
  var titleElem = view.$('.scui-widgettitle-view');
  ok(titleElem, 'title element exists on basic');
  equals(view.get('openHeight'), 225, 'open height is properly calculated from the widget view');
  equals(view.get('closedHeight'), 25, 'closed height is properly calculated from the widget view');
  equals(view.get('currentHeight'), 225, 'current height is properly calculated from the widget view');
  equals(view.get('currentHeight'), view.get('openHeight'), 'on init current height equal to the openHeight');
});
