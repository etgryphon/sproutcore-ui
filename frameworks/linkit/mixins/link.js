/*globals LinkIt*/

/** @class

  This is the canvas tag that draws the line on the screen

  @extends SC.View
  @author Evin Grano
  @author Jonathan Lewis
  @version 0.1
*/

LinkIt.Link = {

  // PUBLIC PROPERTIES
  
  isSelected: NO,

  /**
    Default link drawing style
  */
  linkStyle: {
    cap: LinkIt.ROUND,
    width: 3, // Default: 3 pixels
    color: '#ADD8E6',
    lineStyle: LinkIt.VERTICAL_CURVED,
    directionIndicator: NO // may also be LinkIt.FORWARD or LinkIt.REVERSE (where forward means from 'startNode' to 'endNode')
  },

  /**
    Whether or not we should draw a direction indicator arrowhead at the midpoint of the
    line indicating flow from 'startNode' to 'endNode'.  This setting will be overridden by
    the property of the same name in 'linkStyle' if 'linkStyle' hash is present.

    NOTE: Due to lack of time, currently only supported by line styles LinkIt.VERTICAL_CURVED
    and LinkIt.HORIZONTAL_CURVED.
    
    Possible values are
      LinkIt.FORWARD, LinkIt.REVERSE, or NO for no indicator.
  */
  directionIndicator: NO,
  
  selectionColor: '#FFFF64',
  selectionWidth: 7,
    
  // Graph-Related Properties

  /**
    Object mixing in LinkIt.Node
  */
  startNode: null,

  /**
    String terminal identifier
  */
  startTerminal: null,

  /**
    Object mixing in LinkIt.Node
  */
  endNode: null,

  /**
    String terminal identifier
  */
  endTerminal: null,

  // Draw-Related Properties

  startPt: null,
  endPt: null,

  // PUBLIC METHODS

  /*
    Returns YES if both start and end nodes are present and allow removal of the connection.
  */
  canDelete: function() {
    var startNode = this.get('startNode');
    var endNode = this.get('endNode');
    return !!(startNode && endNode && startNode.canDeleteLink(this) && endNode.canDeleteLink(this));
  },

  drawLink: function(context){
    var linkStyle = this.get('linkStyle') || {};
    var lineStyle = (linkStyle ? linkStyle.lineStyle : LinkIt.STRAIGHT) || LinkIt.STRAIGHT;
    var origColor = linkStyle.color;
    var origWidth = linkStyle.width;
    var isSelected = this.get('isSelected');

    switch (lineStyle){
      case LinkIt.HORIZONTAL_CURVED:
        if (isSelected) {
          linkStyle.color = this.get('selectionColor');
          linkStyle.width = this.get('selectionWidth');
          this.drawHorizontalCurvedLine(context, linkStyle);
          linkStyle.color = origColor;
          linkStyle.width = origWidth;
        }
        this.drawHorizontalCurvedLine(context, linkStyle);
        break;
      case LinkIt.VERTICAL_CURVED:
        if (isSelected) {
          linkStyle.color = this.get('selectionColor');
          linkStyle.width = this.get('selectionWidth');
          this.drawVerticalCurvedLine(context, linkStyle);
          linkStyle.color = origColor;
          linkStyle.width = origWidth;
        }
        this.drawVerticalCurvedLine(context, linkStyle);
        break;
      default:
        if (isSelected) {
          linkStyle.color = this.get('selectionColor');
          linkStyle.width = this.get('selectionWidth');
          this.drawStraightLine(context, linkStyle);
          linkStyle.color = origColor;
          linkStyle.width = origWidth;
        }
        this.drawStraightLine(context, linkStyle);
        break;
    }
  },
  
  drawStraightLine: function(context, linkStyle){
    var startPt = this.get('startPt');
    var endPt = this.get('endPt');
    if (startPt && endPt) {
      context = this._initLineProperties(context, linkStyle);
      context.beginPath();
      context.moveTo(startPt.x, startPt.y);
      context.lineTo(endPt.x, endPt.y);
      context.closePath();
      context.stroke();
    }
  },
  
  drawHorizontalCurvedLine: function(context, linkStyle){
    var startPt = this.get('startPt');
    var endPt = this.get('endPt');
    if (startPt && endPt) {
      context = this._initLineProperties(context, linkStyle);

      // Contruct Data points
      var midX = (startPt.x + endPt.x)/2;
      var midY = (startPt.y + endPt.y)/2;
      this._midPt = { x: midX, y: midY };
    
      var vectX = (startPt.x - endPt.x);
      var vectY = (startPt.y - endPt.y);
    
      // Find length
      var xLen = Math.pow(vectX, 2);
      var yLen = Math.pow(vectY, 2);
      var lineLen = Math.sqrt(xLen+yLen);
    
      // Finded the loop scaler
      var xDiff = Math.abs(startPt.x - endPt.x);
      var yDiff = Math.abs(startPt.y - endPt.y);
      var scaler = 0, diff;
      if (lineLen > 0) {
        diff = (xDiff < yDiff) ? xDiff : yDiff;
        scaler = (diff < 50) ? diff / lineLen : 50 / lineLen;
      }
    
      // Find Anchor points
      var q1X = (startPt.x + midX)/2;
      var q1Y = (startPt.y + midY)/2;
      var q2X = (endPt.x + midX)/2;
      var q2Y = (endPt.y + midY)/2;
    
      // Set the curve direction based off of the y position
      var vectMidY, vectMidX;
      if(startPt.y < endPt.y){
        vectMidY = vectX*scaler;
        vectMidX = -(vectY*scaler);
      }
      else {
        vectMidY = -(vectX*scaler);
        vectMidX = vectY*scaler;
      }
  
      // First Curve Point
      var curve1X = q1X+vectMidX;
      var curve1Y = q1Y+vectMidY;
      this._startControlPt = { x: curve1X, y: curve1Y };
    
      // Second Curve Point
      var curve2X = q2X-vectMidX;
      var curve2Y = q2Y-vectMidY;
      this._endControlPt = { x: curve2X, y: curve2Y };
    
      context.beginPath();
      context.moveTo(startPt.x, startPt.y);
      context.quadraticCurveTo(curve1X,curve1Y,midX,midY);
      context.quadraticCurveTo(curve2X,curve2Y,endPt.x,endPt.y);
      context.stroke();

      var directionIndicator = this.get('directionIndicator');
      if (directionIndicator === LinkIt.FORWARD) {
        this.drawDirectionIndicator(context, midX, midY, curve1X - midX, curve1Y - midY);
      }
      else if (directionIndicator === LinkIt.REVERSE) {
        this.drawDirectionIndicator(context, midX, midY, midX - curve1X, midY - curve1Y);
      }
    }
  },
  
  drawVerticalCurvedLine: function(context, linkStyle){
    var startPt = this.get('startPt');
    var endPt = this.get('endPt');
    if (startPt && endPt) {
      context = this._initLineProperties(context, linkStyle);
    
      // Contruct Data points
      var midX = (startPt.x + endPt.x)/2;
      var midY = (startPt.y + endPt.y)/2;
      this._midPt = { x: midX, y: midY };
    
      var vectX = (startPt.x - endPt.x);
      var vectY = (startPt.y - endPt.y);
    
      // Find length
      var xLen = Math.pow(vectX, 2);
      var yLen = Math.pow(vectY, 2);
      var lineLen = Math.sqrt(xLen+yLen);
    
      // Find the loop scaler
      var xDiff = Math.abs(startPt.x - endPt.x);
      var yDiff = Math.abs(startPt.y - endPt.y);
      var scaler = 0, diff;
      if (lineLen > 0) {
        diff = (xDiff < yDiff) ? xDiff : yDiff;
        scaler = (diff < 50) ? diff / lineLen : 50 / lineLen;
      }
    
      // Find Anchor points
      var q1X = (startPt.x + midX)/2;
      var q1Y = (startPt.y + midY)/2;
      var q2X = (endPt.x + midX)/2;
      var q2Y = (endPt.y + midY)/2;
    
      // Set the curve direction based off of the x position
      var vectMidY, vectMidX;
      if(startPt.x < endPt.x){
        vectMidY = -(vectX*scaler);
        vectMidX = vectY*scaler;
      }
      else {
        vectMidY = vectX*scaler;
        vectMidX = -(vectY*scaler);
      }
  
      // First Curve Point
      var curve1X = q1X+vectMidX;
      var curve1Y = q1Y+vectMidY;
      this._startControlPt = { x: curve1X, y: curve1Y };
    
      // Second Curve Point
      var curve2X = q2X-vectMidX;
      var curve2Y = q2Y-vectMidY;
      this._endControlPt = { x: curve2X, y: curve2Y };
 
      context.beginPath();
      context.moveTo(startPt.x, startPt.y);
      context.quadraticCurveTo(curve1X, curve1Y, midX, midY);
      context.quadraticCurveTo(curve2X, curve2Y, endPt.x, endPt.y);
      context.stroke();

      var directionIndicator = this.get('directionIndicator');
      if (directionIndicator === LinkIt.FORWARD) {
        this.drawDirectionIndicator(context, midX, midY, curve1X - midX, curve1Y - midY);
      }
      else if (directionIndicator === LinkIt.REVERSE) {
        this.drawDirectionIndicator(context, midX, midY, midX - curve1X, midY - curve1Y);
      }
    }
  },
  
  /**
    (centerX, centerY): location of center point of the arrowhead.
    (directionX, directionY): vector describing the direction in which the arrow should point.
  */
  drawDirectionIndicator: function(context, centerX, centerY, directionX, directionY) {
    context.save();
    
    context.translate(centerX, centerY); // artificially move canvas origin to center of the arrowhead
    context.rotate(Math.atan2(directionY, directionX) - Math.atan2(1, 0));
    context.scale(2.5, 2.5);

    context.beginPath();
    context.moveTo(0, -3);
    context.lineTo(2, 3);
    context.lineTo(-2, 3);
    context.lineTo(0, -3);
    context.fill();

    context.restore();
  },

  distanceSquaredFromLine: function(pt) {
    var startPt = this.get('startPt');
    var endPt = this.get('endPt');
    var linkStyle = this.get('linkStyle');
    var lineStyle = linkStyle ? (linkStyle.lineStyle || LinkIt.STRAIGHT) : LinkIt.STRAIGHT;

    if (lineStyle === LinkIt.STRAIGHT) {
      return this._distanceSquaredFromLineSegment(startPt, endPt, pt);
    }
    else {
      var dist1 = this._distanceSquaredFromCurve(startPt, this._midPt, this._startControlPt, pt);
      var dist2 = this._distanceSquaredFromCurve(this._midPt, endPt, this._endControlPt, pt);
      var dist = Math.min(dist1, dist2);
      return dist;
    }
  },

  // PRIVATE METHODS

  /** @private
    * Calculates distance point p is from line segment a, b.
    * All points should be hashes like this: { x: 3, y: 4 }.
    */
  _distanceSquaredFromLineSegment: function(a, b, p) {
    var q;

    if (a.x !== b.x || a.y !== b.y) { // make sure a and b aren't on top of each other (i.e. zero length line)
      var ab = { x: (b.x - a.x), y: (b.y - a.y) }; // vector from a to b

      // Derived from the formula the intersection point of two 2D lines.
      // The two lines are: the infinite line through and a and b, and the infinite line through p
      // that is perpendicular to that line.
      // If f(u) is the parametric equation describing the line segment between a and b, then
      // we are solving for u at the point q where f(u) == intersection of the above two lines.
      // If u is in the interval [0, 1], then the intersection is somewhere between A and B.
      var numerator = (ab.x * (p.x - a.x)) + ((p.y - a.y) * ab.y);
      var u = numerator / ((ab.x * ab.x) + (ab.y * ab.y));
      
      // calculate q as closet point on line segment ab
      if (u <= 0) { // closest point on the line is not between a and b, but closest to a
        q = { x: a.x, y: a.y };
      }
      else if (u >= 1) { // closest point on the line is not between a and b, but closest to b
        q = { x: b.x, y: b.y };
      }
      else { // closest point on the line is between a and b, so calculate it
        var x = a.x + (u * ab.x);
        var y = a.y + (u * ab.y);
        q = { x: x, y: y };
      }
    }
    else { // if a and b are concurrent, the distance we want will be that between a and p.
      q = { x: a.x, y: a.y };
    }

    // vector from p to q.  Length of pq is the shortest distance from p to the line segment ab.
    var pq = { x: (q.x - p.x), y: (q.y - p.y) };
    var distSquared = (pq.x * pq.x) + (pq.y * pq.y);
    return distSquared;
  },
  
  /** @private
    * Calculates a line segment approximation of a quadratic bezier curve and returns
    * the distance between point p and the closest line segment.
    *   a: start point of the quadratic bezier curve.
    *   b: end point
    *   c: bezier control point
    *   p: query point
    */
  _distanceSquaredFromCurve: function(a, b, c, p) {
    var bezierPt, midPt, delta;

    // m and n are the endpoints of the current line segment approximating the part
    // of the bezier curve closest to p.  Start out by approximating the curve with one
    // long segment from a to b.
    var m = { x: a.x, y: a.y };
    var n = { x: b.x, y: b.y };
    var t = 0.5, dt = 0.5; // t is the parameter in the parametric equation describing the bezier curve.
    
    do {
      // Compare the midpoint on the current line segment approximation with the midpoint on the bezier.
      midPt = { x: (m.x + n.x) / 2, y: (m.y + n.y) / 2 };
      bezierPt = this._pointOnBezierCurve(a, c, b, t);
      delta = this._distanceSquared(midPt, bezierPt); // note this is distance squared to avoid a sqrt call.

      if (delta > 16) { // comparing squared distances
        // If the line segment is a bad approximation, narrow it down and try again, using a sort
        // of binary search.
        
        // We'll make a new line segment approximation where one endpoint is the closer of the
        // two original endpoints, and the other is the last point on the bezier curve (bezierPt).
        // Thus our approximation endpoints are always on the bezier and move progressively closer
        // and closer together, and therefore are guaranteed to converge on a short line segment
        // that closely approximates the bezier.  Because we always choose the closer of the last
        // two endpoints as one of the new endpoints, we always converge toward a line segment that is close
        // to our query point p.
        var distM = this._distanceSquared(m, p);
        var distN = this._distanceSquared(n, p);
        dt = 0.5 * dt;

        if (distM < distN) {
          n = bezierPt; // p is closer to m than n, so keep m and our new n will be the last bezier point
          t = t - dt; // new t for calculating the new mid bezier point that will correspond to a new mid point between m and n.
        }
        else {
          m = bezierPt; // p is closer to n than m, so keep n and our new m will be the last bezier point
          t = t + dt;
        }
      }
      else {
        // The line segment matches the corresponding portion of the bezier closely enough
        break;
      }

    } while (true);

    // Return the distance from p to the line segment that closely matches a nearby part of the bezier curve.
    return this._distanceSquaredFromLineSegment(m, n, p);
  },
  
  /** @private
    * Calculates a point on a quadratic bezier curve described by points P0, P1, and P2.
    * See http://en.wikipedia.org/wiki/Bezier_curve for definitions and formula.
    */
  _pointOnBezierCurve: function(p0, p1, p2, t) {
    var x = ((1 - t) * (1 - t) * p0.x) + (2 * (1 - t) * t * p1.x) + (t * t * p2.x);
    var y = ((1 - t) * (1 - t) * p0.y) + (2 * (1 - t) * t * p1.y) + (t * t * p2.y);
    return { x: x, y: y };
  },
  
  /** @private
    * Calculates the distance squared between points a and b.
    * Points are expected to be hashes of the form { x: 3, y: 4 }.
    */
  _distanceSquared: function(a, b) {
    return ((b.x - a.x) * (b.x - a.x)) + ((b.y - a.y) * (b.y - a.y));
  },

  _initLineProperties: function(context, linkStyle){
    this.set('directionIndicator', linkStyle ? linkStyle.directionIndicator : this.get('directionIndicator'));

    if (context) {
      var cap = linkStyle ? (linkStyle.cap || LinkIt.ROUND) : LinkIt.ROUND;
      var color = linkStyle ? (linkStyle.color || '#ADD8E6') : '#ADD8E6';
      var width = linkStyle ? (linkStyle.width || 3) : 3;

      context.lineCap = cap;
      context.strokeStyle = color;
      context.fillStyle = color;
      context.lineWidth = width;
    }
    return context;
  },

  // PRIVATE PROPERTIES
  
  _midPt: null,
  _startControlPt: null, // for drawing bezier curve
  _endControlPt: null // for drawing bezier curve

};

