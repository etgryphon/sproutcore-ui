// ==========================================================================
// SCUI.Resizable
// ==========================================================================

/** @class
  
  Mixin to allow for object movement...
  
  @author Evin Grano
  @version 0.1
  @since 0.1
*/
SCUI.Resizable = {
/* Resizable Mixin */
  viewToResize: null,
  verticalMove: YES,
  horizontalMove: YES,
  
  mouseDown: function(evt) {
    var v, i = {};
    // save mouseDown information...
    v = this.get('viewToResize') || this.get('parentView');
    if (!v) return YES; // nothing to do...
    i.resizeView = v;
    var frame = v.get('frame');
    i.width = frame.width;
    i.height = frame.height;
    i.top = frame.y;
    i.left = frame.x;
    //save mouse down
    i.pageX = evt.pageX; i.pageY = evt.pageY;
    this._mouseDownInfo = i;
    return YES ;
  },

  mouseDragged: function(evt) {
    var i = this._mouseDownInfo ;
    if (!i) return YES;
    
    var deltaX = evt.pageX - i.pageX, deltaY = evt.pageY - i.pageY;
    var view = i.resizeView;
    
    //adjust width
    var hMove = this.get('horizontalMove');
    if (hMove){
      view.adjust('width', i.width + deltaX); //you might want to set minimum width
    }
    //adjust height
    var vMove = this.get('verticalMove');
    if (vMove){
      view.adjust('height', i.height + deltaY); //you might want to set minimum height
    }
    // reset top for centerX coords
    view.adjust('top', i.top); 
    // reset left for centerY coords
    view.adjust('left', i.left);
    return YES ;
  }
};

