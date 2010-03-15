
/** @class

  This is a Drawing View:
  If you want to draw a new shape you can pass in the information:
  For a Line:
    {
      +shape: SCUI.LINE,
      +start: {x: 0, y: 0},
      +end: {x: 100, y: 100},
      ?style: {
        ?width: 5,
        ?color: 'orange' | '#FFA500' | 'rgb(255,165,0)' | 'rgba(255,165,0,1)'
        ?transparency: 0.2
      }
    }
  For a Rectangle:
    {
      +shape: SCUI.RECT,
      +start: {x: 0, y: 0},
      +size: {width: 100, height: 100},
      ?type: SCUI.FILL | SCUI.STROKE
      ?style: {
        ?width: 5,
        ?color: 'orange' | '#FFA500' | 'rgb(255,165,0)' | 'rgba(255,165,0,1)'
        ?transparency: 0.2
      }
    }
  For a Circle:
    {
      +shape: SCUI.CIRCLE,
      +center: {x: 0, y: 0},
      +radius: 20,
      ?type: SCUI.FILL | SCUI.STROKE
      ?style: {
        ?width: 5,
        ?color: 'orange' | '#FFA500' | 'rgb(255,165,0)' | 'rgba(255,165,0,1)'
        ?transparency: 0.2
      }
    }
  For a Polygon:
    {
      +shape: SCUI.POLY
      +path: [
        +{x: 0, y: 0},
        +{x: 10, y: 10},
        ?{x: 0, y: 50}
      ],
      ?type: SCUI.FILL | SCUI.STROKE
      ?style: {
        ?width: 5,
        ?color: 'orange' | '#FFA500' | 'rgb(255,165,0)' | 'rgba(255,165,0,1)'
        ?transparency: 0.2
      }
    }
  
  @extends SC.View
  @since SproutCore 1.0
*/
SCUI.LINE = 'line';
SCUI.RECT = 'rect';
SCUI.CIRCLE = 'circle';
SCUI.POLY = 'poly';

SCUI.FILL = 'fill';
SCUI.STROKE = 'stroke';


SCUI.DrawingView = SC.View.extend({
  
  classNames: 'scui-drawing-view',
  
  shapes: [],
  
  _drawingManager: {},
  
  shapesDidChange: function(){
    this.set('layerNeedsUpdate', YES);
    this.updateLayerIfNeeded();
  }.observes('*shapes.[]'),
  
  init: function(){
    sc_super();
    
    // Register Basic Shapes
    
    // Drawing a Line
    this.registerShapeDrawing( SCUI.LINE, function(ctx, params){
      if (params.style){
        if (params.style.width) ctx.lineWidth = params.style.width;
        if (params.style.color) ctx.strokeStyle = params.style.color;
        if (params.style.transparency) ctx.globalAlpha = params.style.transparency;
      }
      ctx.beginPath();
      ctx.moveTo(params.start.x, params.start.y);
      ctx.lineTo(params.end.x, params.end.y);
      ctx.stroke();
    });
    
    // Drawing a Rectangle
    this.registerShapeDrawing( SCUI.RECT, function(ctx, params){
      if (params.style){
        if (params.style.width) ctx.lineWidth = params.style.width;
        if (params.style.color) ctx.fillStyle =  ctx.strokeStyle = params.style.color;
        if (params.style.transparency) ctx.globalAlpha = params.style.transparency;
      }
      switch(params.type){
        case SCUI.FILL:
          ctx.fillRect(params.start.x, params.start.y, params.size.width, params.size.height);
          break;
        case SCUI.STROKE:
          ctx.strokeRect(params.start.x, params.start.y, params.size.width, params.size.height);
          break;
        default:
          ctx.clearRect(params.start.x, params.start.y, params.size.width, params.size.height);
          break;
      }
    });
    
    // Drawing a Circle
    this.registerShapeDrawing( SCUI.CIRCLE, function(ctx, params){
      if (params.style){
        if (params.style.width) ctx.lineWidth = params.style.width;
        if (params.style.color) ctx.fillStyle =  ctx.strokeStyle = params.style.color;
        if (params.style.transparency) ctx.globalAlpha = params.style.transparency;
      }
      ctx.beginPath();
      ctx.arc(params.center.x,params.center.y,params.radius,0,Math.PI*2,true);
      if (params.type === SCUI.FILL) ctx.fill();
      else ctx.stroke();
    });
    
    // Drawing a Polygon
    this.registerShapeDrawing( SCUI.POLY, function(ctx, params){
      if (params.style){
        if (params.style.width) ctx.lineWidth = params.style.width;
        if (params.style.color) ctx.fillStyle =  ctx.strokeStyle = params.style.color;
        if (params.style.transparency) ctx.globalAlpha = params.style.transparency;
      }
      ctx.beginPath();
      var len = params.path ? params.path.length : 0;
      if (len < 2) return;
      
      var path = params.path, curr;
      ctx.moveTo(path[0].x, path[0].y);
      for(var i = 1; i < len; i++){
        curr = path[i];
        ctx.lineTo(curr.x, curr.y);
      }
      ctx.lineTo(path[0].x, path[0].y);
      if (params.type === SCUI.FILL) ctx.fill();
      else ctx.stroke();
    });
  },
  
  render: function(context, firstTime) {
    //console.log('%@.render()'.fmt(this));
    var frame = this.get('frame');
    if (firstTime) {
      if (!SC.browser.msie) {
        context.push('<canvas class="base-layer" width="%@" height="%@">You can\'t use canvas tags</canvas>'.fmt(frame.width, frame.height));
      }
    }
    else {
      var canvasElem = this.$('canvas.base-layer');
      if (canvasElem) {
        canvasElem.attr('width', frame.width);
        canvasElem.attr('height', frame.height);
        if (canvasElem.length > 0) {
          var cntx = canvasElem[0].getContext('2d'); // Get the actual canvas object context
          if (cntx) {
            cntx.clearRect(0, 0, frame.width, frame.height);
            this._drawShapes(cntx);
          }
          else {
            console.error("SCUI.DrawingView.render(): Canvas object context is not accessible.");
          }
        }
        else {
          console.error("SCUI.DrawingView.render(): Canvas element array length is zero.");
        }
      }
      else {
        console.error("SCUI.DrawingView.render(): Canvas element is not accessible.");
      }
    }
    
    return sc_super();
  },
  
  registerShapeDrawing: function(name, drawingFunction){
    if (!name) {
      console.error('Can\'t register this drawing paradigm because name is null');
      return NO;
    }
    
    // OK, create the drawing paradigm
    this._drawingManager[name] = drawingFunction;
    this.set('layerNeedsUpdate', YES);
    this.updateLayerIfNeeded();
    return YES;
  },
  
  /**
    @private 
    
    Function for actually drawing the shapes that we have listed
  */
  _drawShapes: function(cntx){
    var curr;
    var shapes = this.get('shapes');
    var drawingFunc;
    for (var i=0,len=shapes.length;i<len;i++){
      curr = shapes[i];
      drawingFunc = this._drawingManager[curr.shape];
      if (drawingFunc) drawingFunc(cntx, curr);
    }
  }
});

