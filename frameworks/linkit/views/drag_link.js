// ==========================================================================
// LinkIt.DragLink
// ==========================================================================
/*globals G_vmlCanvasManager*/

sc_require('mixins/link');

/** @class

  This is the canvas tag that draws the line on the screen

  @extends SC.View
  @author Evin Grano
  @author Jonathan Lewis
  @version 0.1
*/

LinkIt.DragLink = SC.View.extend( LinkIt.Link,
/** @scope LinkIt.DragLink.prototype */ {

  classNames: ['linkIt-draglink'],
  
  displayProperties: ['startPt', 'endPt'],
  
  render: function(context, firstTime) {
    if (firstTime){
      if (!SC.browser.msie) {
        context.push('<canvas>test</canvas>');
      }
    }
    else
    { 
      //LinkIt.log('Drawing DragLink...');
      var canvasElem = this.$('canvas');
      var frame = this.get('frame');
      
      if (canvasElem && frame) {
        var width = frame.width;
        var height = frame.height;
    
        // Set the position, height, and width
        canvasElem.attr('width', width);
        canvasElem.attr('height', height);

        if (canvasElem.length > 0) {
          var cntx = this._canvasie ? this._canvasie.getContext('2d') : canvasElem[0].getContext('2d'); // Get the actual canvas object context
          if (cntx) {
            cntx.clearRect(0, 0, width, height);

            // Find the X Draw positions
            var startPt = this.get('startPt');
            var endPt = this.get('endPt');
      
            // skip if they are the same...
            var xDiff = Math.abs(startPt.x - endPt.x);
            var yDiff = Math.abs(startPt.y - endPt.y);
            if (xDiff > 5 || yDiff > 5){
              if (this.drawLink) {
                this.drawLink(cntx);
              }
            }
          }
          else {
            LinkIt.log("LinkIt.DragLink.render(): Canvas object context is not accessible.");
          }
        }
        else {
          LinkIt.log("LinkIt.DragLink.render(): Canvas element has length zero.");
        }
      }
      else {
        LinkIt.log("LinkIt.DragLink.render(): Canvas element or frame unaccessible.");
      }
    }
    sc_super();
  },

  didCreateLayer: function(){
    if (SC.browser.msie) {
      var frame = this.get('frame');
      var canvas = document.createElement('CANVAS');
      canvas.width = frame.width;
      canvas.height = frame.height;
      this.$().append(canvas);
      canvas = G_vmlCanvasManager.initElement(canvas);
      this._canvasie = canvas;
    }
    
    this.set('layoutNeedsUpdate', YES);
  }
  
});

