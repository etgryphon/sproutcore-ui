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

  renderMixin: function(context, firstTime){
    var toolTip = this.get('toolTip');

    var attr = {
      title: toolTip,
      alt: toolTip
    };

    context = context.attr(attr);
  }
};

