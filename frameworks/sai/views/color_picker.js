// ==========================================================================
// Project:   SCUI.ColorPicker
// ==========================================================================
/*globals SCUI Raphael*/
require('color_picker/colorpicker');
/** @class

  this view makes the awesome raphael.js colorpicker work in sproutcore

  
  @extends SC.View
*/

SCUI.ColorPicker = SC.View.extend(
/** @scope SCUI.ColorPicker.prototype */ {
  
  render: function(context, firstTime){
    context.push('<input type="text" id="output" value="#eeeeee"');
  },
  
  didCreateLayer: function(){
    var out = document.getElementById("output"); 
    // this is where colorpickers created 
    var cp = Raphael.colorpicker(40, 20, 300, "#eee"); 
    var cp2 = Raphael.colorwheel(360, 20, 300, "#eee"); 
    // assigning onchange event handler 
    out.onkeyup = cp.onchange = cp2.onchange = function (clr) { clr = this === out ? this.value : clr; out.value = clr; this !== cp && cp.color(clr); this !== cp2 && cp2.color(clr); out.style.background = clr; out.style.color = Raphael.rgb2hsb(clr).b < .5 ? "#fff" : "#000"; }; 
    // that’s it. Too easy 
  }
  
});

