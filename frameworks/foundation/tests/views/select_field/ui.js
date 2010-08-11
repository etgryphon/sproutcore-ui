
htmlbody('<style> .sc-static-layout { border: 1px red dotted; } </style>');

var pane = SC.ControlTestPane.design()
    .add("basic", SCUI.SelectFieldView, { 
       objects:["1","2","3","4","5"]
    })
    
    .add("multiple", SCUI.SelectFieldView, { 
      layout: {left:0,right:0,height:80},
       objects:["1","2","3","4","5"],
       multiple: YES
    })
  
    .add("disabled", SCUI.SelectFieldView, { 
      isEnabled: NO, objects:["1","2","3","4","5"]
    })
  
    .add("Not Selected", SCUI.SelectFieldView, { 
      isSelected: NO, objects:["1","2","3","4","5"]
    })
  
    .add("Not Visible", SCUI.SelectFieldView, { 
      isVisible: NO, objects:["1","2","3","4","5"]
    })
  
    .add("sortedStringOptions", SCUI.SelectFieldView, { 
      objects:["Apple","Sproutcore 1.0","Development","Charles"],
  useStaticLayout: YES, 
      layout: { width: 'auto', right: 'auto' }
    })
      .add("unSortedStringOptions", SCUI.SelectFieldView, { 
        objects:["Apple","Sproutcore 1.0","Development","Charles"],
    useStaticLayout: YES, 
    disableSort: YES,
        layout: { width: 'auto', right: 'auto' }
      })
  
    .add("Width 150 Right 0", SCUI.SelectFieldView, { 
      objects: [1,6,11,2,8],
      useStaticLayout: YES, 
      layout: { width: '150', right: '0' }
    })
  .add("redraw", SCUI.SelectFieldView, { 
    useStaticLayout: YES, 
    layout: { width: '150', right: '0' }
  });
  
  
  
    pane.show();

// ..........................................................
// TEST VIEWS
// 

module('SCUI.SelectFieldView ui', pane.standardSetup());

test("basic", function() {
  var view = pane.view('basic');
  ok(!view.$().hasClass('disabled'), 'should not have disabled class');
  ok(!view.$().hasClass('sel'), 'should not have sel class');
});

test("multiple", function() {
  var view = pane.view('basic');
  ok(view.get('isVisibleInWindow'), 'should be visible in window');
  ok(!view.$().hasClass('disabled'), 'should not have disabled class');
  ok(!view.$().hasClass('sel'), 'should not have sel class');
});

test("disabled", function() {
  var view = pane.view('disabled');
  ok(view.$().hasClass('disabled'), 'should have disabled class');
});

test("Not Selected", function() {
  var view = pane.view('Not Selected');
  ok(!view.$().hasClass('disabled'), 'should not have disabled class');
  ok(!view.$().hasClass('sel'), 'should not have sel class');
});

test("Not Visible", function() {
  var view = pane.view('Not Visible');
  ok(!view.$().hasClass('disabled'), 'should not have disabled class');
  ok(!view.$().hasClass('sel'), 'should not have sel class');
});

test("sortedStringOptions", function() {
   var view = pane.view('sortedStringOptions');
   equals(null,view.get('sortKey'), 'sortkey not specified');
});

test("Width 150 Right 0", function() {  
  var view = pane.view('Width 150 Right 0');
  ok(!view.$().hasClass('disabled'), 'should not have disabled class');
  ok(!view.$().hasClass('sel'), 'should not have sel class');
});

test("Check that by setting the value the selection actually changes", function() {  
  var view = pane.view('Width 150 Right 0');
  SC.RunLoop.begin();
  view.set('value',2);
  SC.RunLoop.end();
  equals(view.getFieldValue(), 2, 'the field value should change to 2');
});

test("redraw", function(){
  var view = pane.view('redraw');
  ok(view.get('objects').length === 0, "objects should be empty");
  SC.RunLoop.begin();
  view.set('objects', [1,6,11,2,8]);
  SC.RunLoop.end();
  ok(view.$('option').length === 5, "options length should be 5");
});
