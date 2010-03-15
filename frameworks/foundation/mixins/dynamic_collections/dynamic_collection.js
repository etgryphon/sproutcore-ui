// ==========================================================================
// SCUI.DropDown
// ==========================================================================

sc_require('core');

/** 
  @mixin:
  
  TODO: [EG] Add Documentation...
  
  NOTE: This mixin must be used in conjunction with the SCUI.DynamicListItem mixin on the 
        list item views and SCUI.CollectionViewDynamicDelegate on the delegate.

  @author Evin Grano
*/

SCUI.DynamicCollection = {
  
  isDynamicCollection: YES,
  
  customRowViewMetadata: null,
  
  initMixin: function() {
    this.set('customRowViewMetadata', SC.SparseArray.create());
    this.set('rowDelegate', this);
  },
  
  /**
    @property
  */
  rowMargin: 0, 
  
  /**
    Returns the item view for the content object at the specified index. Call
    this method instead of accessing child views directly whenever you need 
    to get the view associated with a content index.

    Although this method take two parameters, you should almost always call
    it with just the content index.  The other two parameters are used 
    internally by the CollectionView.

    If you need to change the way the collection view manages item views
    you can override this method as well.  If you just want to change the
    default options used when creating item views, override createItemView()
    instead.

    Note that if you override this method, then be sure to implement this 
    method so that it uses a cache to return the same item view for a given
    index unless "force" is YES.  In that case, generate a new item view and
    replace the old item view in your cache with the new item view.

    @param {Number} idx the content index
    @param {Boolean} rebuild internal use only
    @returns {SC.View} instantiated view
  */
  itemViewForContentIndex: function(idx, rebuild) {
    // return from cache if possible
    var content   = this.get('content'),
        itemViews = this._sc_itemViews,
        item = content.objectAt(idx),
        contentDel  = this.get('contentDelegate'),
        del = this.get('delegate'),
        groupIndexes = contentDel.contentGroupIndexes(this, content),
        isGroupView = NO,
        key, ret, E, layout, layerId, rootController;

    // use cache if available
    if (!itemViews) itemViews = this._sc_itemViews = [] ;
    if (!rebuild && (ret = itemViews[idx])) return ret ; 

    // otherwise generate...

    // first, determine the class to use
    isGroupView = groupIndexes && groupIndexes.contains(idx);
    if (isGroupView) isGroupView = contentDel.contentIndexIsGroup(this, item, idx);
    if (isGroupView) {
      key  = this.get('contentGroupExampleViewKey');
      if (key && item) E = item.get(key);
      if (!E) E = this.get('groupExampleView') || this.get('exampleView');

    } else {
      E = this.invokeDelegateMethod(del, 'collectionViewContentExampleViewFor', this, item, idx);
      //try the exampleViewKey
      if(!E){
        key  = this.get('contentExampleViewKey');
        if (key && item) E = item.get(key);
      }
      //use the standard example view
      if (!E) E = this.get('exampleView');
    }
    // collect some other state
    var attrs = this._TMP_ATTRS;
    attrs.contentIndex = idx;
    attrs.content      = item ;
    attrs.owner        = attrs.displayDelegate = this;
    attrs.parentView   = this.get('containerView') || this ;
    attrs.page         = this.page ;
    attrs.layerId      = this.layerIdFor(idx, item);
    attrs.isEnabled    = contentDel.contentIndexIsEnabled(this, item, idx);
    attrs.isSelected   = contentDel.contentIndexIsSelected(this, item, idx);
    attrs.outlineLevel = contentDel.contentIndexOutlineLevel(this, item, idx);
    attrs.disclosureState = contentDel.contentIndexDisclosureState(this, item, idx); // TODO: [EG] Verify that this is still necessary...
    attrs.isGroupView  = isGroupView;
    attrs.isVisibleInWindow = this.isVisibleInWindow;
    if (isGroupView) attrs.classNames = this._GROUP_COLLECTION_CLASS_NAMES;
    else attrs.classNames = this._COLLECTION_CLASS_NAMES;
    
    // generate the customRowHeightIndexes for this view
    layout = this.layoutForContentIndex(idx);
    if (layout) {
      attrs.layout = layout;
    } else {
      delete attrs.layout ;
    }
    
    /** 
      This uses the controllerForContent method in CollectionViewExtDelegate
      below. It will add a rootController property to your itemView if you
      have implemented the controllerForContent method in your controller.
      Otherwise this property will not show up on your view.
    */
    
    /* 
      [JH2] I changed this method invocation to a direct call instead of a 
      call through the invokeDelegateMethod because it was always returning 
      null
    */
    rootController = del.controllerForContent(item);
    if (rootController) {
      attrs.rootController = rootController;
    }else{
      delete attrs.rootController;
    }
    
    /**
      Add the Dynamic delegate if the Example view is A DynamicListItem
    */
    attrs.dynamicDelegate = del;
    var viewMetadata = this.invokeDelegateMethod(del, 'contentViewMetadataForContentIndex', this, idx);
    if (viewMetadata) {
      attrs.viewMetadata = viewMetadata;
    } else {
      delete attrs.viewMetadata ;
    } 

    ret = this.createItemView(E, idx, attrs);
    if (!viewMetadata) {
      viewMetadata = this.invokeDelegateMethod(del, 'collectionViewSetMetadataForContentIndex', this, ret.get('viewMetadata'), idx);
      //console.log('Store Metadata for (%@): with height: %@'.fmt(idx, viewMetadata.height));
    }
    itemViews[idx] = ret ;
    
    return ret ;
  },
  
  /**
  
    Computes the layout for a specific content index by combining the current
    row heights.
  
  */
  layoutForContentIndex: function(contentIndex) {
    var margin = this.get('rowMargin');
    return {
      top:    this.rowOffsetForContentIndex(contentIndex),
      height: this.rowHeightForContentIndex(contentIndex),
      left:   margin, 
      right:  margin
    };
  },
  
  /**
    Called for each index in the customRowHeightIndexes set to get the 
    actual row height for the index.  This method should return the default
    rowHeight if you don't want the row to have a custom height.
    
    The default implementation just returns the default rowHeight.
    
    @param {SC.CollectionView} view the calling view
    @param {Object} content the content array
    @param {Number} contentIndex the index 
    @returns {Number} row height
  */
  contentIndexRowHeight: function(view, content, contentIndex) {
    //console.log('DynamicCollection(%@): contentIndexRowHeight for (%@)'.fmt(this, contentIndex));
    var height = this.get('rowHeight');
    if (view && view.get('isDynamicCollection')){
      var metadata = view.get('customRowViewMetadata');
      if (!SC.none(metadata)) {
        var currData = metadata.objectAt(contentIndex);
        if (currData && currData.height) height = currData.height;
      }
    }
    //console.log('Returning Height: %@'.fmt(height));
    return height;
  }
};

