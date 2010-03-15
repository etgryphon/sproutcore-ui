//============================================================================
// SCUI.SearchableArrayController
//============================================================================
sc_require('core');
/**

  This is an implementation of searchable for plain ArrayControllers
  *****This is a hybrid of the collection controller stack*****
  
  @extends SC.ArrayController
  @author Joshua Holt
  @author Evin Grano
  @version 0.5
  @since 0.5

*/

SCUI.SearchableArrayController = SC.ArrayController.extend(
  /* @scope SCUI.SearchableArrayController.prototype */{
  
  search: null,
  searchResults: [],
  searchKey: 'name',
  
  init: function(){
    sc_super();
    this.set('searchResults', []);
    this._runSearch();
  },
  
  _searchOrContentDidChange: function(){
    this._runSearch();
  }.observes('search', 'content'),
  
 _sanitizeSearchString: function(str){
   var specials = [
       '/', '.', '*', '+', '?', '|',
       '(', ')', '[', ']', '{', '}', '\\'
   ];
   var s = new RegExp('(\\' + specials.join('|\\') + ')', 'g');
   return str.replace(s, '\\$1');
 },
   
 _runSearch: function(){
    var searchResults  = [];
    var search = this.get('search');
    var searchKey = this.get('searchKey');
    var searchRegex = new RegExp(search,'i');
    var content = this.get('content');
  
    if(search === null || search === '' || search === undefined){ 
      this.set('searchResults', content);
    }
    else {
      search = this._sanitizeSearchString(search).toLowerCase();
      
      var curObj, searchField, searchTokens, token, tokenLen;
      for (var i=0, len = content.get('length'); i < len; i++) {
        curObj = content.objectAt(i);
        searchField = curObj.get(searchKey);
        if (!searchField) continue;
        if ( searchField.match(searchRegex) ){
          searchResults.push(curObj);
        }
      }
      this.set('searchResults',searchResults);
    }
 }
  
});

