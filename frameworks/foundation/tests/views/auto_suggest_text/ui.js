// ========================================================================
// SCUI.AutoSuggestTextView Tests
// ========================================================================

sc_require('core');

// /* Test SCUI.AutoSuggestTextView */
// SCUI.autoSuggestTestListController = SC.ArrayController.create({
//   content: [ 
//     SC.Object.create({name: 'Test 1'}),
//     SC.Object.create({name: 'Test 2'}),
//     SC.Object.create({name: 'Test 3'}),
//     SC.Object.create({name: 'Test 4'}),
//     SC.Object.create({name: 'Test 5'})
//   ],
//   
//   search: '',
//   searchContent: null,
//   
//   _updateSearchContent: function(){
//     var c = this.get('content');
//     var search = this.get('search');
//     
//     if (!search || !c){
//       this.set('searchContent', c);
//     }
//     else {
//       search = search.toLowerCase();
//       var currAsset, currSearchFields;
//       var searchArray = [];
//       for(var i = 0, len = c.get('length'); i < len; i++){
//         currAsset = c.objectAt(i);
//         currSearchFields = currAsset.get('name');
//         if (currSearchFields.match(search)) searchArray.push(currAsset);
//       }
//       
//       this.set('searchContent', searchArray);
//     }
//   },
//   
//   _searchHasChanged: function(){
//     console.log('_searchHasChanged');
//     this._updateSearchContent();
//   }.observes('search')
//   
// });

// SCUI.autoSuggestTestSearchListController = SC.ArrayController.create({
//   contentBinding: 'SCUI.autoSuggestTestListController.searchContent'
// });

var pane = SC.ControlTestPane.design()
  .add("basic", SCUI.AutoSuggestTextView, {
    layout: {height: 20, width: 200}
    //valueBinding: 'SCUI.autoSuggestTestListController.search',
    //contentPath: 'SCUI.autoSuggestTestSearchListController',
    //selectionPath: 'SCUI.autoSuggestTestSearchListController.selection'
  });

pane.show(); // add a test to show the test pane
window.pane = pane ;

// ..........................................................
// BASIC TESTS
// 
module("Basic Tests", pane.standardSetup());

test("init rendered", function() {
  var view = pane.view('basic');
  ok(view.get('isVisibleInWindow'), 'basic.isVisibleInWindow should be YES');
  console.log('Basic View (%@)'.fmt(view));
});
