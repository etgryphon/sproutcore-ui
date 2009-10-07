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
    var v, i, offset; 
    //console.log('Mobility Mouse Down called...');
    // save mouseDown information...
    v = this.get('viewThatMoves');
    if (!v) return YES; // nothing to do...
    i = (this._mouseDownInfo = SC.clone(v.get('layout')));
    i.pageX = evt.pageX; i.pageY = evt.pageY ;
    return YES ;
  },
  
  _adjustViewLayoutOnDrag: function(view, curZone, altZone, delta, i, headKey, tailKey, centerKey, sizeKey) {
    // collect some useful values...
    var inAltZone = false; //(altZone === HEAD_ZONE) || (altZone === TAIL_ZONE);
    var head = i[headKey], tail = i[tailKey], center = i[centerKey], size = i[sizeKey];
    //this block determines what layout coordinates you have (top, left, centerX,centerY, right, bottom)
    //and adjust the view depented on the delta
    if (!inAltZone && !SC.none(size)) {
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
    //console.log('Mobility Mouse Drag...');
    // adjust the layout...
    var i = this._mouseDownInfo ;
    var deltaX = evt.pageX - i.pageX, deltaY = evt.pageY - i.pageY;
    var view = this.get('viewThatMoves');
    
    this._adjustViewLayoutOnDrag(view, i.zoneX, i.zoneY, deltaX, i, 'left', 'right', 'centerX', 'width') ;
    this._adjustViewLayoutOnDrag(view, i.zoneY, i.zoneX, deltaY, i, 'top', 'bottom', 'centerY', 'height') ;
    return YES ;
  }
};