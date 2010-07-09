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
  /*
    thie size of the color picker... be sure to leave room
    for the text box
  */
  size: 160,
  
  displayProperties: 'value'.w(),
  
  
  render: function(context, firstTime){
    var value = this.get('value');
    if( this._cp){
      if(this._cp.color() !== value) this._cp.color(value);
    }
  },
  
  didAppendToDocument: function(){    
    
    var pv = this.get('parentView'), frame = this.get('frame');
    var newFrame = pv ? pv.convertFrameToView(frame, null) : frame;
    // this is where colorpickers created
    
    // HACK: [MT] - Hack to get the color picker working at all times in IE by creating a fresh version everytime
    if(!this._cp || SC.browser.msie){
      
      // do some cleanup first if it's IE, then create the color picker
      if (this._cp && SC.browser.msie) {
        this._cp.remove();
      }
      
      var layer = this.$().get(0), that = this, cp;
      //compute the parent frame

      this._cp = cp = Raphael.colorpicker(newFrame.x, newFrame.y, this.get('size'), this.get('value'), layer);

      //event handler for color picker view
      this._cp.onchange = function(color){
        that.setIfChanged('value', color);
      };
    }
    else{
      this._cp.x = newFrame.x;
      this._cp.y = newFrame.y;
    }

  },
  
  willDestroyLayer: function(){
    if(this._cp) this._cp.remove();
  }
  
});

