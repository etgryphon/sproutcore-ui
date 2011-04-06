/*globals SCUI */

SCUI.Searchable = {  
  isSearchable: YES,
  
  /* Params */
  search: null,
  searchResults: [],
  searchKey: 'name',
  minSearchLen: null,
  searchPause: null,
  
  _lastTime: null,
  
  initMixin: function() {
    // init some functions
    this.minSearchLen = this.minSearchLen || 1;
    this.searchPause = this.searchPause || 100;
    this.set('searchResults', []);
    this._runSearch();
  },
  
  _searchDidChange: function(){
    var sp = this.searchPause, c,
        s = this.get('search') || "",
        mc = this.minSearchLen;
        
    // Check for min length
    if (s.length < mc) {
      c = this.get('content') || [];
      this.set('searchResults', c);
      return;
    }
    
    if (sp > 0) {
      this._setSearchInterval(sp);
    }
    else {
      this._runSearch();
    }
    
   }.observes('search', 'content'),
   
   _setSearchInterval: function(pause){
     var that = this;
     if(this._searchTimer) {
       this._searchTimer.invalidate();
       delete this._searchTimer;
     }
     this._searchTimer = SC.Timer.schedule({
       interval: pause,
       action: function(){ that._runSearch(); }
     });
   },

  _sanitizeSearchString: function(str){
    var specials = [
        '/', '.', '*', '+', '?', '|',
        '(', ')', '[', ']', '{', '}', '\\'
    ];
    this._cachedRegex = this._cachedRegex || new RegExp('(\\' + specials.join('|\\') + ')', 'g');
    return str.replace(this._cachedRegex, '\\$1');
  },
  
  _runSearch: function(){
    var sr = this.get('searchResults'), 
        sk, search = this.get('search'),
        c = this.get('content');
        
    if (c && !SC.none(search)) {
      if (sr) delete sr;
      search = this._sanitizeSearchString(search).toLowerCase();
      this._lastSearch = search;
      sk = this.get('searchKey');
      sr = this.runSearch(search, c, sk);
    }
    else if (!c) {
      sr = [];
    }
    this.set('searchResults', sr);
  },

  /* OVERRIDE to give the custom searching functionality */
  runSearch: function(search, content, searchKey){
    return content;
  }
};

