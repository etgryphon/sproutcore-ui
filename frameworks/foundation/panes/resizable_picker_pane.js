// ========================================================================
// SCUI.ResizablePickerPane
// ========================================================================

/**

  Picker pane with bottom right resizable thumb.

  @extends SC.PickerPane
  @author Josh Holt
  @author Jonathan Lewis


*/

SCUI.ResizablePickerPane = SC.PickerPane.extend({
  
  maxHeight: null,
  minHeight: null,
  maxWidth: null,
  minWidth: null,
  
  createChildViews: function() {
    sc_super();
    
    var childViews = this.get('childViews');
    var view = null;

    view = this.createChildView(
      SC.View.design(SCUI.Resizable, {
        classNames: ['picker-resizable-handle'],
        layout: {bottom: 0, right: 0, height: 16, width: 16},
        viewToResizeBinding: SC.Binding.oneWay('.parentView'),
        maxHeight: this.get('maxHeight'),
        maxWidth: this.get('maxWidth'),
        minHeight: this.get('minHeight'),
        minWidth: this.get('minWidth')
      })
    );
    childViews.push(view);
    this.set('childViews', childViews);
  }
});