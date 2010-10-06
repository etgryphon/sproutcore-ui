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
  iconKey: 'icon',
  nameKey: 'name',

  runSearch: function(search, content, searchKey){
    var searchResults, searchRegex = new RegExp(search,'i');
    
    this._iconKey = this.get('iconKey');
    this._nameKey = this.get('nameKey');
    searchResults = this._runSearchOnItem(content, search, searchRegex, searchKey);
    
    // create the root search tree
    var searchedTree = SC.Object.create({
      treeItemIsExpanded: YES,
      treeItemChildren: searchResults
    });
    
    return searchedTree;
  },
  
  /** 
    @private
    Returns a flat list of matches for the foldered tree item.
  */
  _runSearchOnItem: function(treeItem, search, searchRegex, searchKey) {
    var searchMatches = [], iconKey = this.get('iconKey'),
        searchedList, key, searchLen, 
        children, nameKey = this._nameKey, that;
    
    if (SC.none(treeItem)) return searchMatches;
    
    children = treeItem.get('treeItemChildren');
    if (!children) children = treeItem.get('children');
    that = this;
    children.forEach( function(child){      
      if (child.treeItemChildren) {
        var searchedList = that._runSearchOnItem(child, search, searchRegex, searchKey);
        searchedList.forEach( function(m){ searchMatches.push(m); });
      }
      
      if (searchKey && child.get(searchKey)) {
        key = child.get(searchKey).toLowerCase();
        if(key.match(searchRegex)){
          searchMatches.push(child);
        } 
      }
    });

    // Add properties for basic selection support
    searchMatches.set('allowsSelection', this.get('allowsSelection'));
    searchMatches.set('allowsMultipleSelection', this.get('allowsMultipleSelection'));
    searchMatches.set('allowsEmptySelection', this.get('allowsEmptySelection'));

    return searchMatches;
  }
});

