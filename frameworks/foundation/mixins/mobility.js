// ==========================================================================
// SCUI.Mobility
// ==========================================================================

/** @class
  
  Mixin to allow for object movement...
  
  @author Evin Grano
  @version 0.1
  @since 0.1
*/
SCUI.Mobility = {
/* Mobility Mixin */
  viewThatMoves: null,
  
  mouseDown: function(evt) {
    var v, i; 
    // save mouseDown information...
    v = this.get('viewThatMoves') || this;
    if (!v) return YES; // nothing to do...
    
    i = SC.clone(v.get('layout'));
    i.pageX = evt.pageX; i.pageY = evt.pageY ;
    this._mouseDownInfo = i;
    return YES ;
  },
  
  _adjustViewLayoutOnDrag: function(view, curZone, altZone, delta, i, headKey, tailKey, centerKey, sizeKey) {
    // collect some useful values...
    var head = i[headKey], tail = i[tailKey], center = i[centerKey], size = i[sizeKey];
    
    //this block determines what layout coordinates you have (top, left, centerX, centerY, right, bottom)
    //and adjust the view depented on the delta
    if (!SC.none(size)) {
      if (!SC.none(head)) {
        view.adjust(headKey, head + delta);
      } else if (!SC.none(tail)) {
        view.adjust(tailKey, tail - delta) ;
      } else if (!SC.none(center)) {
        view.adjust(centerKey, center + delta);
      }
    }
  },
  
  mouseDragged: function(evt) {
    // adjust the layout...
    var i = this._mouseDownInfo ;
    if(i){
      var deltaX = evt.pageX - i.pageX, deltaY = evt.pageY - i.pageY;
      var view = this.get('viewThatMoves') || this;
    
      this._adjustViewLayoutOnDrag(view, i.zoneX, i.zoneY, deltaX, i, 'left', 'right', 'centerX', 'width') ;
      this._adjustViewLayoutOnDrag(view, i.zoneY, i.zoneX, deltaY, i, 'top', 'bottom', 'centerY', 'height') ;
      return YES ;
    }
    return NO;
  }
};

