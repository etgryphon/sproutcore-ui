// ==========================================================================
// SCUI.SearchableTreeController
// ==========================================================================
sc_require('controllers/searchable');
/** @class
  
  An tree controller that is searchable and creates a flat search results like
  OSX Finder and Windows Explorer
  
  @extends SC.TreeController
  @author Evin Grano
  @author Brandon Blatnick
  @version 0.5
  @since 0.5
*/

SCUI.SearchableTreeController = SC.TreeController.extend( SCUI.Searchable,
/** @scope SCUI.SearchableTreeController.prototype */ 
{
  
  /*  This can be an array or single */
  store: null,
  orderBy: 'name ASC',
  baseSearchQuery: null,
  baseSearchArray: null,
  
  _baseArray: null,
  
  runSearch: function(search, content, searchKey){
    var searchResults, searchRegex = new RegExp(search,'i');
    
    this._baseArray = this.get('baseSearchArray') || this._createRecordArray();
    searchResults = this._searchInternalArray(searchRegex, this._baseArray, searchKey);
        
    // create the root search tree
    // TODO: [EG] Potential optimization, use the same SC.Object
    var searchedTree = SC.Object.create({
      treeItemIsExpanded: YES,
      treeItemChildren: searchResults
    });
    
    return searchedTree;
  },
  
  _createRecordArray: function(){
    var query, params = {}, store = this.get('store'),
        bsq = this.get('baseSearchQuery'), ret = [];
    if (store && bsq) ret = store.find(bsq);
    return ret;
  },
  
  _searchInternalArray: function(search, content, searchKey){
    var searchField, searchResults = [];
  
    content.forEach( function(x){
      searchField = x.get(searchKey);
      if ( searchField && searchField.match(search) ){
        searchResults.push(x);
      }
    });
  
    return searchResults;
  }
});

