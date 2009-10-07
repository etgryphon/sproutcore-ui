// ========================================================================
// SCUI.DashboardView Tests
// ========================================================================

/* Test SCUI.DashboardView */

/**
  HTML Style setup
*/
htmlbody('<style> .test1example, .test2example { border: 1px red dotted; } .scui-widget-view { border: 2px green solid;} .scui-widgettitle-view { background-color: green; color: white;}</style>');

SCUI.WidgetTest1ExampleView = SC.View.extend({
  layout: {width: 200, height: 150},
  classNames: ['test1example'],
  content: null,
  render: function(context, firstTime){
    var c = this.get('content');
    var box1 = 'Error', box2 = 'Error';
    if (c){
      box1 = c.get('box1');
      box2 = c.get('box2');
    }
    context = context.begin('div').addClass('box-one').text(box1).end();
    context = context.begin('div').addClass('box-two').text(box2).end();
  }
});

SCUI.WidgetTest2ExampleView = SC.View.extend({
  layout: {width: 300, height: 100},
  classNames: ['test2example'],
  content: null,
  render: function(context, firstTime){
    var c = this.get('content');
    var name = 'No Name', box = 'Error';
    if (c) box = c.get('box');
    context = context.begin('div').addClass('box').text(box).end();
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
  .add("basic", SCUI.DashboardColumnView, {
    layout: {height: 550},
    content: [
      SC.Object.create({
        exampleView: SCUI.WidgetTest1ExampleView,
        content: SC.Object.create({
          name: 'Basic 1',
          box1: 'Box One Text',
          box2: 'Box Two Text'
        })
      }),
      SC.Object.create({
        exampleView: SCUI.WidgetTest2ExampleView,
        content: SC.Object.create({
          name: 'Basic 2',
          box: 'Cool Content'
        })
      }),
      SC.Object.create({
        exampleView: SCUI.WidgetTest2ExampleView,
        content: SC.Object.create({
          name: 'Basic 3',
          box: 'More Cool Stuff'
        })
      })//,
      // SC.Object.create({
      //   exampleView: SCUI.WidgetTestWebView,
      //   content:  SC.Object.create({
      //     name: 'Test Title: Web 1',
      //     size: {width: 200, height: 200},
      //     value: 'http://www.google.com'
      //   })
      // })//,
      // SC.Object.create({
      //   exampleView: SCUI.WidgetTestWebView,
      //   content:  SC.Object.create({
      //     name: 'Test Title: Web 2',
      //     size: {width: 200, height: 200},
      //     value: 'http://www.foxnews.com'
      //   })
      // })
    ]
  });
  
  
pane.show(); // add a test to show the test pane
window.pane = pane ;

// ..........................................................
// BASIC TESTS
// 
module("Basic Tests", pane.standardSetup());

test("init", function() {
  var view = pane.view('basic');
});