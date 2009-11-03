// ==========================================================================
// SCUI.BasicViewSelectionSupport
// ==========================================================================

/**

  A mixin that provides very basic selection support for a view. When mixed in
  with a view, the view's layer will be updated when the isSelected property has
  changed. If iSelected is true then the layer's class will have the 'selected'
  tag added to it, otherwise the 'selected' tag will be removed. 
  
  This mixin can be used in cases when a view serves a purpose outside of being 
  a list item and selection is not its core responsiblity.
  
  @author Michael Cohen
  @version 0.1
  @since 0.1

*/

SCUI.BasicViewSelectionSupport = {
 
  /** Walk like a duck */
  isBasicViewSelectionSupport: YES,
  
  /**
    Indicates if the view is selected or not.
  */
  isSelected: NO,
  
  /**
    Overrides the view's didCreateLayer so that we can make sure
    the view does pickup changes to the selected property.
  */
  didCreateLayer: function() {
    sc_super();
    this._bvss_isSelectedDidChange();
  },
  
  /** @private
    When isSelected changes the view's layer gets updated so that the
    class property has 'selected' added when isSelected is true, otherwise
    the 'selected' tag is removed.
  */
  _bvss_isSelectedDidChange: function() {
    if (this.get('isSelected')) {
      this.$().addClass('selected');
    } else {
      this.$().removeClass('selected');
    }
  }.observes('isSelected')
  
};