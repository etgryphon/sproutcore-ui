// ==========================================================================
// SCUI.StatusChanged
// ==========================================================================

sc_require('core');

/**
  @namespace
  
  A render mixin that adds tooltip attributes to the layer DOM.
  
  @author: Michael Harris
  @version: 0.5
  @since: 0.5
*/
SCUI.ToolTip = {
  
  toolTip: '',
  /*
    We only want to set the alt attribute if this is mixed-in to an image
    otherwise the alt attribute is useless and pollutes the DOM.
  */
  isImage: NO,

  renderMixin: function(context, firstTime){
    var toolTip = this.get('toolTip');
    var isImage = this.get('isImage'), attr;
    
    if (isImage) {
      attr = {
        title: toolTip,
        alt: toolTip
      };
    } else {
      attr = {
        title: toolTip
      };
    }
    
    context = context.attr(attr);
  }
};

