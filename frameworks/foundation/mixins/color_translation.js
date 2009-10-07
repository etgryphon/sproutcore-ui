// ==========================================================================
// SCUI.ColorTranslation
// ==========================================================================

sc_require('core');

/** @class
  
  Mixing to translate RGB values to HEX
  
  @author Mohammed Taher
  @version 0.1
  @since 0.1
*/

SCUI.ColorTranslation = {
  
  /**
    Takes a string in the form of rgb(r, g, b) - where r, g
    and b are numbers - and returns the r value.

    @param {String} RGB String
    @returns {String} the r value
  */  
  getR: function(rgb) {
    var openingBracketIndex = rgb.indexOf('(');
  	var firstCommaIndex = rgb.indexOf(',');		
  	return rgb.substring(openingBracketIndex + 1, firstCommaIndex).trim();
  },

  /**
    Takes a string in the form of rgb(r, g, b) - where r, g
    and b are numbers - and returns the g value.

    @param {String} RGB String
    @returns {String} the g value
  */
  getG: function (rgb) {
    var firstCommaIndex = rgb.indexOf(',');		
    var rgbSubString = rgb.substring(firstCommaIndex + 1);
  	var secondCommaIndex = rgbSubString.indexOf(',');
  	return rgbSubString.substring(0, secondCommaIndex).trim();
  },

  /**
    Takes a string in the form of rgb(r, g, b) - where r, g
    and b are numbers - and returns the b value.

    @param {String} RGB String
    @returns {String} the b value
  */
  getB: function(rgb) {
    var firstCommaIndex = rgb.indexOf(',');		
    var rgbSubString = rgb.substring(firstCommaIndex + 1);
    var secondCommaIndex = rgbSubString.indexOf(',');
  	return rgbSubString.substring(secondCommaIndex + 1).trim();
  },

  toHex: function(value) {    
   if (SC.none(value)) return '00';

   value = parseInt(value, 10);
   if (value === 0 || isNaN(value)) return '00';

   value = Math.max(0, value); 
   value = Math.min(value, 255);  
   value = Math.round(value);

   return "0123456789ABCDEF".charAt((value - value % 16) / 16) + "0123456789ABCDEF".charAt(value % 16);
  },
  
  RGB2Hex: function(r, g, b) {
    return this.toHex(r) + this.toHex(g) + this.toHex(b);
  }
  
} ;