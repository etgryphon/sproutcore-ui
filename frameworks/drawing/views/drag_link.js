// ==========================================================================
// SCUI.DragLinkView
// ==========================================================================

sc_require('views/drawing');

/** @class

  This is the canvas tag that draws the link on the screen

  @extends SC.DrawingView
  @author Evin Grano
  @version 0.1
*/

SCUI.DragLinkView = SCUI.DrawingView.extend(
/** @scope SCUI.DragLinkView.prototype */ {

  classNames: ['scui-draglink'],
  
  /**
   * @property
   * Property for the start of the link
   */
  startPoint: null,
  
  /**
   * @property
   * Property for the end of the link
   */
  endPoint: null,
  
  /**
   * Default Styling
   */
  linkParams: {
    shape: SCUI.LINE,
    style: {
      color: 'black',
      width: 2
    }
  },
  
  _pointsDidChange: function(){
    var sp = this.get('startPoint'),
        ep = this.get('endPoint'),
        xDiff, yDiff, newLink;
    
    xDiff = Math.abs(sp.x - ep.x);
    yDiff = Math.abs(sp.y - ep.y);
    if (xDiff > 5 || yDiff > 5){
      newLink = this.createLinkShape();
      this.setIfChanged('shapes', [newLink]);
    }    
  }.observes('startPoint', 'endPoint', 'linkParams'),
  
  /**
   * Override this function with the particular shape that you want to draw.
   * @returns OBJECT
   */
  createLinkShape: function(startPoint, endPoint){
    var dp = this.get('linkParams');
    
    dp.shape = dp.shape || SCUI.LINE;
    dp.start = {x: startPoint.x, y: startPoint.y};
    dp.end = {x: endPoint.x, y: endPoint.y};
    dp.style = dp.style || { color: 'black', width: 2 };
    
    return dp;
  }  
});

