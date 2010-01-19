// ========================================================================
// SCUI SnapLines
// ========================================================================
sc_require('views/drawing');
/**
  @mixin
  @author Mike Ball
  
  Add this Mixin to any View and it gives you an API to draw snap lines for
  all the child views
*/

//the number of pixles that will cause a snap line (factor of 2?)
SCUI.SNAP_ZONE = 5;

SCUI.LINE = {
  shape: SCUI.LINE,
  start: {x: 0, y: 0},
  end: {x: 0, y: 0},
  style: {
    width: 0.5,
    color: '#00c6ff'
    //transparency: 0.2
  }
};


SCUI.SnapLines = {
  
  hasSnapLines: YES,
  
  
  
  /*
    @param {Array} ignoreViews array of views to not include
    sets up the data structure used for the line drawing
  */
  setupData: function(ignoreViews){
    if(!ignoreViews) ignoreViews = [];
    this.removeLines(); //can't have any existing lines
    this._xPositions = {};
    this._yPositions = {}; 
    
    var xPositions = this._xPositions, yPositions = this._yPositions, children = this.get('childViews'), 
        that = this, parentView, frame, minX, midX, maxX, minY, midY, maxY, factor = (SCUI.SNAP_ZONE*2);
    
    
    // little insert utility
    var insert = function(min, mid, max, child, positions){
      var origMin = min, origMid = mid, origMax = max;
      min = Math.floor(min/factor);
      mid = Math.floor(mid/factor);
      max = Math.floor(max/factor);
      if(positions[min]){
        positions[min].push({value: origMin, child: child});
      }
      else{
        positions[min] = [{value: origMin, child: child}];
      }
      
      if(positions[mid]){
        positions[mid].push({value: origMid, child: child});
      }
      else{
        positions[mid] = [{value: origMid, child: child}];
      }
      
      if(positions[max]){
        positions[max].push({value: origMax, child: child});
      }
      else{
        positions[max] = [{value: origMax, child: child}];
      }
    };

    parent = this;    
    children.forEach(function(child){
      if(ignoreViews.indexOf(child) < 0){
        frame = parent ? parent.convertFrameToView(child.get('frame'), null) : child.get('frame');
      
        minX = frame.x;
        midX = SC.midX(frame);
        maxX = frame.x + frame.width;
        insert(minX, midX, maxX, child, xPositions);
      
      
        minY = frame.y;
        midY = SC.midY(frame);
        maxY = frame.y + frame.height;
        insert(minY, midY, maxY, child, yPositions);
      }
    });

    //add the parent
    parent = this.get('parentView');
    frame = parent ? parent.convertFrameToView(this.get('frame'), null) : this.get('frame');
    minX = frame.x;
    midX = SC.midX(frame);
    maxX = frame.x + frame.width;
    insert(minX, midX, maxX, this, xPositions);
    
    
    minY = frame.y;
    midY = SC.midY(frame);
    maxY = frame.y + frame.height;
    insert(minY, midY, maxY, this, yPositions);
    
    
  },
  
  /**
    
  */
  drawLines: function(view){
    if(!this._drawingView){
      this._drawingView = this.createChildView(SCUI.DrawingView.design({
        shapes: []
      }));
    }
    var factor = (SCUI.SNAP_ZONE*2), shapes = [], xline, yline, frame, parent, rMinX, rMidX, rMaxX,
        rMinY, rMidY, rMaxY, rMinXMod, rMidXMod, rMaxXMod, rMinYMod, rMidYMod, rMaxYMod;
    //get the frame and all the relavent points of interest
    parent = view.get('parentView');
    frame = parent ? parent.convertFrameToView(view.get('frame'), null) : this.get('frame');
    rMinX = SC.minX(frame);
    rMidX = SC.midX(frame);
    rMaxX = SC.maxX(frame);
    rMinY = SC.minY(frame);
    rMidY = SC.midY(frame);
    rMaxY = SC.maxY(frame);
    rMinXMod = Math.floor(rMinX/factor);
    rMidXMod = Math.floor(rMidX/factor);
    rMaxXMod = Math.floor(rMaxX/factor);
    rMinYMod = Math.floor(rMinY/factor);
    rMidYMod = Math.floor(rMidY/factor);
    rMaxYMod = Math.floor(rMaxY/factor);
    
    //compute the three possible line positions
    //TODO: [MB] should really sort these by the direction of the drag...
    if(this._xPositions[rMinXMod]){
      //draw X line
      xline = SC.copy(SCUI.LINE);
      xline.start = {x: this._xPositions[rMinXMod][0].value, y: 0};
      xline.end = {x: this._xPositions[rMinXMod][0].value, y: frame.height};
      shapes.push(xline);
    }
    else if(this._xPositions[rMidXMod]){
      //draw X line
      xline = SC.copy(SCUI.LINE);
      xline.start = {x: this._xPositions[rMidXMod][0].value, y: 0};
      xline.end = {x: this._xPositions[rMidXMod][0].value, y: frame.height};
      shapes.push(xline);
    }
    else if(this._xPositions[rMaxXMod]){
      //draw X line
      xline = SC.copy(SCUI.LINE);
      xline.start = {x: this._xPositions[rMaxXMod][0].value, y: 0};
      xline.end = {x: this._xPositions[rMaxXMod][0].value, y: frame.height};
      shapes.push(xline);
    }
    //Y line positions
    if(this._yPositions[rMinYMod]){
      //draw Y line
      yline = SC.copy(SCUI.LINE);
      yline.start = {y: this._yPositions[rMinYMod][0].value, x: 0};
      yline.end = {y: this._yPositions[rMinYMod][0].value, x: frame.width};      
      shapes.push(xline);
    }
    else if(this._yPositions[rMidYMod]){
      //draw X line
      yline = SC.copy(SCUI.LINE);
      yline.start = {y: this._yPositions[rMidYMod][0].value, x: 0};
      yline.end = {y: this._yPositions[rMidYMod][0].value, x: frame.width};
      shapes.push(xline);
    }
    else if(this._yPositions[rMaxYMod]){
      //draw X line
      yline = SC.copy(SCUI.LINE);
      yline.start = {y: this._yPositions[rMaxYMod][0].value, x: 0};
      yline.end = {y: this._yPositions[rMaxYMod][0].value, x: frame.width};
      shapes.push(xline);
    }
    console.log(shapes);
    this._drawingView.set('shapes', shapes);
    
    return view;
  },
  
  /*
    called to cleanup the lines...
  */
  removeLines: function() {
    this._xPositions = null;
    this._yPositions = null;
    if(this._drawingLine) this.removeChild(this._drawingLine)
  }
};

