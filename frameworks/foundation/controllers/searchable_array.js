//============================================================================
// SCUI.SearchableArrayController
//============================================================================
sc_require('controllers/searchable');
/**

  This is an implementation of searchable for plain ArrayControllers
  *****This is a hybrid of the collection controller stack*****
  
  @extends SC.ArrayController
  @author Joshua Holt
  @author Evin Grano
  @version 0.5
  @since 0.5

*/

SCUI.SearchableArrayController = SC.ArrayController.extend( SCUI.Searchable,
  /* @scope SCUI.SearchableArrayController.prototype */{
  
  runSearch: function(search, content, searchKey){
    var curObj, searchField, searchTokens, 
        searchResults = [], token, tokenLen,
        searchRegex = new RegExp(search,'i');
    for (var i=0, len = content.get('length'); i < len; i++) {
      curObj = content.objectAt(i);
      searchField = curObj.get(searchKey);
      if (!searchField) continue;
      if ( searchField.toLowerCase().match(searchRegex) ){
        searchResults.push(curObj);
      }
    }

    return searchResults;
  }
  
});

