// ========================================================================
// SCUI.SelectFieldTab Tests
// ========================================================================


/*global module test htmlbody ok equals same stop start */


htmlbody('<style> .sc-static-layout { border: 1px red dotted; } </style>');

(function() {  
  var pane = SC.ControlTestPane.design()
    
    .add("tabView1", SCUI.SelectFieldTab, { 
      nowShowing: 'tab2',

      items: [
        { title: "tab1", value: "tab1" },
        { title: "tab2", value: "tab2" },
        { title: "tab3", value: "tab3" }
      ],
      
      itemTitleKey: 'title',
      itemValueKey: 'value',
      layout: { left:12, height: 200, right:12, top:12 }
      
  })
  
  .add("tabView2", SCUI.SelectFieldTab, { 
    nowShowing: 'tab3',

    items: [
      { title: "tab1", value: "tab1" },
      { title: "tab2", value: "tab2" },
      { title: "tab3", value: "tab3" }
    ],
    
    itemTitleKey: 'title',
    itemValueKey: 'value',
    layout: { left:12, height: 200, right:12, top:12 }
    
    })
    .add("tabView3", SCUI.SelectFieldTab, { 
      
      items: [
        { title: "tab1", value: "tab1" },
        { title: "tab2", value: "tab2" },
        { title: "tab3", value: "tab3" }
      ],
      
      itemTitleKey: 'title',
      itemValueKey: 'value',
      layout: { left:12, height: 200, right:12, top:12}
    });
    
  pane.show(); // add a test to show the test pane

  // ..........................................................
  // TEST VIEWS
  // 
  module('SC.TabView ui', pane.standardSetup());
  
  test("Check that all tabViews are visible", function() {
    ok(pane.view('tabView1').get('isVisibleInWindow'), 'tabView1.isVisibleInWindow should be YES');
    ok(pane.view('tabView2').get('isVisibleInWindow'), 'tabView2.isVisibleInWindow should be YES');
    ok(pane.view('tabView3').get('isVisibleInWindow'), 'tabView3.isVisibleInWindow should be YES');
   });
   
   
   test("Check that the tabView has the right classes set", function() {
     var viewElem=pane.view('tabView1').$();
     var select=pane.view('tabView1').$('select');
     ok(viewElem.hasClass('sc-view'), 'tabView1.hasClass(sc-view) should be YES');
     ok(viewElem.hasClass('scui-select-field-tab-view'), 'tabView1.hasClass(sc-tab-view) should be YES');
     ok(select[0].className.indexOf('sc-select-field-view')>=0, 'tabView1 should contain a select view');
     ok(select[0].options.length==3, 'tabView1 should have 3 options');
   });
  

})();
