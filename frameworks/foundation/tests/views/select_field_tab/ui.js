// ========================================================================
// SCUI.SelectFieldTab Tests
// ========================================================================


/*global module test htmlbody ok equals same stop start SCUI */


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
  module('SCUI.TabView ui', pane.standardSetup());
  
  test("Check that all tabViews are visible", function() {
    ok(pane.view('tabView1').get('isVisibleInWindow'), 'tabView1.isVisibleInWindow should be YES');
    ok(pane.view('tabView2').get('isVisibleInWindow'), 'tabView2.isVisibleInWindow should be YES');
    ok(pane.view('tabView3').get('isVisibleInWindow'), 'tabView3.isVisibleInWindow should be YES');
   });
   
   
   test("Check that the tabView has the right classes set", function() {
     var viewElem=pane.view('tabView1').$();
     var selectButton=pane.view('tabView1').get('childViews')[1];
     var selectButtonElem=selectButton.$();
     ok(viewElem.hasClass('sc-view'), 'tabView1.hasClass(sc-view) should be YES');
     ok(viewElem.hasClass('scui-select-field-tab-view'), 'tabView1.hasClass(scui-select-field-tab-view) should be YES');
     ok(selectButton != null, 'tabView1 should contain a selectButton view');
     ok(selectButtonElem.hasClass('select-button'), 'tabView1 selectButton.hasClass(select-button) should be YES');
     ok(selectButton.get('objects').get('length') === 3, 'tabView1 selectButton should have 3 items');
   });
  

})();

