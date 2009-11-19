// ==========================================================================
// SCUI.SearchableTreeController
// ==========================================================================

sc_require('core');

/** @class
  
  An tree controller that is searchable and creates a flat search results like
  OSX Finder and Windows Explorer
  
  @extends SC.TreeController
  @author Evin Grano
  @author Brandon Blatnick
  @version 0.5
  @since 0.5
*/

SCUI.SearchableTreeController = SC.TreeController.extend(
/** @scope SCUI.SearchableTreeController.prototype */ 
{
   search: null,
   searchResults: [],
   searchKey: 'name',

   init: function(){
     sc_super();
     this.set('searchResults', []);
     this._runSearch();
   },

   _searchDidChange: function(){
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
    var searchResults = [];
    var search = this.get('search');
    var c = this.get('content');
    if(search === null || search === '' || search === undefined){ 
      this.set('searchResults', c);
    }
    else {
      search = this._sanitizeSearchString(search).toLowerCase();
      var searchRegex = new RegExp(search,'i');
      var searchKey = this.get('searchKey');
      searchResults = this._runSearchOnItem(c, search, searchRegex, searchKey);
      
      // create the root search tree
      var searchedTree = SC.Object.create({
        treeItemIsExpanded: YES,
        treeItemChildren: searchResults
      });
      this.set('searchResults', searchedTree);
    }
  },
  
  /** 
    @private
    Returns a flat list of matches for the foldered tree item.
  */
  _runSearchOnItem: function(treeItem, search, searchRegex, searchKey) {
    var searchMatches = [];
    var children = treeItem.get('treeItemChildren');
    if (!children) children = treeItem.get('children');
    var key, searchLen;
    for (var i = 0, len = children.length; i < len; i++) {
      var child = children[i];
      
      if (child.treeItemChildren) {
        var searchedList = this._runSearchOnItem(child, search);
        searchLen = searchedList.length;
        for (var j = 0; j < searchLen; j++) {
          searchMatches.push(searchedList[j]);
        }
      }
      
      if (searchKey && child.get(searchKey)) {
        key = child.get(searchKey).toLowerCase();
        if(key.match(searchRegex)){
          var match = SC.Object.create({});
          match[searchKey]  = child.get(searchKey);
          match.treeItem    = child;
          match.icon        = child.get('icon');
          searchMatches.push(match);
        } 
      }
    }

    return searchMatches;
  }
});
