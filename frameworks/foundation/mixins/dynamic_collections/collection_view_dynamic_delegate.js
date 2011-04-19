// ==========================================================================
// SCUI.CollectionViewDynamicDelegate
// ==========================================================================

/** @mixin
  
  TODO: [EG] Add Documentation
  
  NOTE: This mixin must be used in conjunction with the SC.CollectionRowDelegate, SCUI.DynamicListItem mixin on the 
        list item views and SCUI.DynamicCollection on the view.

  @author Evin Grano
*/

SCUI.CollectionViewDynamicDelegate = {
  
  isCollectionViewDynamicDelegate: YES,
  
  /**
    This method returns an exampleView class for the passed content
    
    
    @param {SC.CollectionView} view the collection view
    @param {SC.Object} the content for this view
    @returns {SC.View} Instance of the view you'd like to use
  */
  collectionViewContentExampleViewFor: function(view, content, contentIndex) {
    return null ;
  },
  
  /**
    ControllerForContentIndex should accept the index [Number]
    of an item in a recordArray. It should then determine what type of 
    Object controller it should create for the contentItem and return it.
    
    @param content [Object]
    @returns controller [SC.ObjectContrller]
  */
  controllerForContent: function(content){
    return null;
  },
  
  customRowViewMetadata: null,
  
  contentViewMetadataForContentIndex: function(view, contentIndex){
    //console.log('CollectionViewDynamicDelegate(%@): contentViewMetadataForContentIndex for (%@)'.fmt(this, contentIndex));
    var data = null;
    if (view && view.get('isDynamicCollection')){
      var metadata = view.get('customRowViewMetadata');
      if (!SC.none(metadata)) {
        data = metadata.objectAt(contentIndex);
      }
    }
    return data;
  },
  
  contentViewDidChangeForContentIndex: function(view, contentView, content, contentIndex){
    //console.log('CollectionViewDynamicDelegate(%@): contentViewDidChangeForContentIndex for (%@)'.fmt(this, contentIndex));
    // Add it to the customRowHeightIndexes
    if (view && view.isDynamicCollection && contentView && contentView.isDynamicListItem){
      this.collectionViewSetMetadataForContentIndex(view, contentView.get('viewMetadata'), contentIndex);
    }
  },
  
  collectionViewInsertMetadataForContentIndex: function(view, newData, contentIndex){
    var metadata = view.get('customRowViewMetadata');
    if (SC.none(metadata)) return;
    
    var len = metadata.get('length');
    console.log('Before Insert Length: %@'.fmt(len) );
    if (len < 1) metadata = [newData];
    else metadata.replace(contentIndex, 0, [newData]);
    console.log('After Insert Length: %@'.fmt(metadata.length) );
    view.set('customRowViewMetadata', metadata);
    view.rowHeightDidChangeForIndexes(contentIndex);
  },
  
  collectionViewSetMetadataForContentIndex: function(view, newData, contentIndex){
    console.log('\nCollectionViewDynamicDelegate(%@): collectionViewSetMetadataForContentIndex for (%@)'.fmt(this, contentIndex));
    if (view && view.get('isDynamicCollection')){
      var indexes = view.get('customRowHeightIndexes');
      if (SC.none(indexes)) indexes = SC.IndexSet.create();
      indexes.add(contentIndex, 1);
      view.set('customRowHeightIndexes', indexes);
      
      var metadata = view.get('customRowViewMetadata');
      if (SC.none(metadata)) metadata = SC.SparseArray.create();
      metadata.replace(contentIndex, 1, [newData]);
      view.set('customRowViewMetadata', metadata);
      view.rowHeightDidChangeForIndexes(contentIndex);
    }
        
    return newData;
  }
  
};

