// ==========================================================================
// Project:   SCUI.BarGraph
// ==========================================================================
/*globals SCUI Raphael*/
require('graphing/graphael');
require('graphing/gbar');
/** @class

  this view makes the awesome raphael.js bar graphs work in sproutcore

  
  @extends SC.View
*/

SCUI.BarGraph = SC.View.extend(
/** @scope SCUI.BarGraph.prototype */ {
  
  /*
  
  */
  content: null,
  
  
  render: function(context, firstTime){
  },
  
  didAppendToDocument: function(){    
    // this is where colorpickers created
    var layer = this.$().get(0);
    var r = Raphael(layer),
    fin = function () {
      this.flag = r.g.popup(this.bar.x, this.bar.y, this.bar.value || "0").insertBefore(this);
    },
    fout = function () {
      this.flag.animate({opacity: 0}, 300, function () {this.remove();});
    },
    fin2 = function () {
      var y = [], res = [];
      for (var i = this.bars.length; i--;) {
        y.push(this.bars[i].y);
        res.push(this.bars[i].value || "0");
      }
      this.flag = r.g.popup(this.bars[0].x, Math.min.apply(Math, y), res.join(", ")).insertBefore(this);
    },
    fout2 = function () {
      this.flag.animate({opacity: 0}, 300, function () {this.remove();});
    };
    
    r.g.hbarchart(0, 0, 300, 220, [this.get('content')]).hover(fin, fout);
    this._raphael = r;
  },
  
  willDestroyLayer: function(){
    if(this._raphael) this._raphael.remove();
  }
  
});

