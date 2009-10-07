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
    var value = '';
    if (c) value = c.get('value');
    //context = context.begin('iframe').attr({'width': '300', 'height': '200', 'src': value}).end();
    context = context.begin('div').addClass('box').text(value).end();
  }
});

var pane = SC.ControlTestPane.design({
    layout: { right: 5, width: 850, top: 75, bottom: 5 }
  })
  .add("basic", SCUI.DashboardView, {
    layout: {width: 800, height: 800},
    content: [
      SC.Object.create({
        exampleView: SCUI.WidgetTest1ExampleView,
        col: 0,
        colIndex: 0,
        content: SC.Object.create({
          name: 'Widget #1',
          box1: 'Init Pos: Column 1, Pos 1',
          box2: 'Box Two Text'
        })
      }),
      SC.Object.create({
        exampleView: SCUI.WidgetTest2ExampleView,
        col: 0,
        colIndex: 1,
        content: SC.Object.create({
          name: 'Widget #2',
          box: 'Init Pos: Column 1, Pos 2'
        })
      }),
      SC.Object.create({
        exampleView: SCUI.WidgetTest2ExampleView,
        col: 1,
        colIndex: 2,
        content: SC.Object.create({
          name: 'Widget #3',
          box: 'Init Pos: Column 2, Pos 1'
        })
      }),
      SC.Object.create({
        exampleView: SCUI.WidgetTest1ExampleView,
        col: 1,
        colIndex: 1,
        content: SC.Object.create({
          name: 'Widget #4',
          box1: 'Init Pos: Column 2, Pos 2',
          box2: 'Box Two Text'
        })
      }),
      SC.Object.create({
        exampleView: SCUI.WidgetTestWebView,
        col: 1,
        colIndex: 0,
        content:  SC.Object.create({
          name: 'Orion',
          size: {width: 350, height: 400},
          value: '/orion'
        })
      })//,
      // SC.Object.create({
      //   exampleView: SCUI.WidgetTestWebView,
      //   col: 1,
      //   colIndex: 2,
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
console.log('\n\n\nTESTING...\n\n');
// ..........................................................
// BASIC TESTS
// 
module("Basic Tests", pane.standardSetup());

test("init", function() {
  var view = pane.view('basic');
});