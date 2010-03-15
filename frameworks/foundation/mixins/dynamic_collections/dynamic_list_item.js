// ==========================================================================
// SCUI.DynamicListItem
// ==========================================================================

sc_require('core');

/** @mixin
  This mixin allows for dynamic root controllers and dynamic root heights
  
  This mixin must be used in conjunction with the SCUI.DynamicCollection mixin on the 
        collection view and SCUI.CollectionViewDynamicDelegate on the delegate.

  @author Evin Grano
*/

SCUI.DynamicListItem = {
  
  /** walk like a duck */
  isDynamicListItem: YES,
  
  /**
    @property: {SC.Object} The dynamic delegate that is called to do adjustments
  */
  dynamicDelegate: null,
  
  /**
    @property {SC.ObjectController | SC.ArrayController}
  */
  rootController: null,
  
  /**
    @property {Object}
  */
  viewMetadata: null,
  
  viewMetadataHasChanged: function(){
    //console.log('\n\nDynamicListItem: viewMetadataHasChanged...');
    var del = this.get('dynamicDelegate');
    this.invokeDelegateMethod(del, 'contentViewDidChangeForContentIndex', this.owner, this, this.get('content'), this.contentIndex);
  }
};

