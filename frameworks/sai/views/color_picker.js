// ==========================================================================
// Project:   SCUI.ColorPicker
// ==========================================================================
/*globals SCUI Raphael*/
require('color_picker/colorpicker');
require('color_picker/colorwheel');
/** @class

  this view makes the awesome raphael.js colorpicker work in sproutcore

  
  @extends SC.View
*/

SCUI.ColorPicker = SC.View.extend(
/** @scope SCUI.ColorPicker.prototype */ {
  
  /*
    the current color value in hex
  */
  value: "#eee",
  
  displayProperties: 'value'.w(),
  
  
  render: function(context, firstTime){
    var value = this.get('value');
    if(firstTime){
      context.push('<input type="text" value="%@" />'.fmt(value));
    }
    else if( this._cp && this._output){
      if(this._cp.color() !== value) this._cp.color(value);
      if(this._output.value !== value) this._output.value = value;
    }
  },
  
  didAppendToDocument: function(){    
    // this is where colorpickers created
    var layer = this.$().get(0), that = this, output = this.$('input').get(0), cp;
    //compute the parent frame
    var pv = this.get('parentView'), frame = this.get('frame');
    var newFrame = pv ? pv.convertFrameToView(frame, null) : frame;
    
    this._cp = cp = Raphael.colorpicker(newFrame.x, newFrame.y, 160, this.get('value'), layer);
    this._output = output;
    
    
    this._cp.onchange = function(color){
      output.value = color;
      output.style.background = color; 
      output.style.color = Raphael.rgb2hsb(color).b < 0.5 ? "#fff" : "#000";
      that.setIfChanged('value', color);
    };
    output.onkeyup = function(){
      var val = this.value;
      cp.color(val);
      that.setIfChanged('value', val);
    };
    
    //var cp2 = Raphael.colorwheel(360, 20, 300, "#eee");  
  },
  
  willDestroyLayer: function(){
    if(this._cp) this._cp.remove();
  }
  
});

