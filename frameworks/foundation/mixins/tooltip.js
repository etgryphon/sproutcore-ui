
sc_require('core');

/**
 * A render mixin that adds tooltip attributes to the layer DOM.
 *
 * @author Michael Harris
 * @since FR3
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

