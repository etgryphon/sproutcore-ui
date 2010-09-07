/*globals SCUI*/

sc_require('core');

/**
  @namespace
  
  A render mixin that adds tooltip attributes to the layer DOM.
  
  @author: Michael Harris
  @author: Jonathan Lewis
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
    
    // Create a tooltip if alwaysEnableToolTip is YES
    if ( this.get('alwaysEnableToolTip') && !toolTip ) {
      toolTip = this.get('title');
    }
    
    // make sure the tooltip is a string, and don't allow any double quote characters
    toolTip = (SC.typeOf(toolTip) === SC.T_STRING) ? SC.RenderContext.escapeHTML(toolTip).replace(/\"/g, '\'') : '';
    
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

