// ========================================================================
// SCUI.LoadingSpinnerView
// ========================================================================

/**

  Implements a PNG based animated loading spinner.
  The animation is simulated, offering the benefit of using a PNG sprite for
  the actual image so that more than 256 colors and transparency may be used.

  How to use:
    {{{ //TBD
    var spinner=SCUI.LoadingSpinnerView.create({
      theme:'lightTrans',
      layout:{top:0,left:0,width:50,height:50}
    }).append();
    
    var parent = MyApp.getPath('path_to_parent_view');
    spinner.appendTo(parent);
    }}}

  @extends SC.View
  @author Alex Percsi

*/

SCUI.LoadingSpinnerView = SC.View.extend({

  layout: {left:0,right:0,top:0,bottom:0},

  //Number of frames in the PNG sprite
  totalFrames:28,
  
  //Number of millisesconds to display each frame
  frameChangeInterval:100,
  
  //+1 for every append call, -1 for every remove call
  _appendCount:0,
  
  //call this method to show the spinner. Pass in the view you want to append the spinner to. 
  //The method will return a reference to the spinner.
  appendTo: function(parentView){
    if (this.get('_appendCount')===0)
    {
      parentView.appendChild(this);
    }
    
    //increase append count on next runloop to make sure view has finished appending.
    this.invokeLater(function(){this.set('_appendCount',this.get('_appendCount')+1);});
    return this;
  },
  
  //Call this method to hide the spinner. 
  //Note that the spinner will only hide once all calls to append have been balanced by an equal number of calls to remove.
  remove: function(){
    this.set('_appendCount',this.get('_appendCount')-1);
    if (this.get('_appendCount')<=0){
      //stop animation
      this.set('_state',this.get('STOPPED'));
      this.get('parentView').removeChild(this);
      this.destroy();
    }
  },
  
  //starts the animation if _appendCount >= 0
  _appendCountDidChange: function(){
    if (this.get('_state')===this.get('STOPPED') && this.get('_appendCount')>0)
    {
      this.set('_state',this.get('PLAYING'));
      this.get('spinnerView').nextFrame();
    }
  }.observes('_appendCount'),
  
  //SCUI includes the following themes by default: darkTrans, lightTrans, darkSolidAqua, darkSolidWhite, lightSolidBlack, lightSolidGreen.
  //You can add your own themes by creating a CSS class with the name of the theme and specifying a background-image with the sprite
  //containing all the animation frames.
  theme: 'lightTrans',
  
  childViews: 'spinnerView'.w(),
  
  spinnerView: SC.View.design({
    layout:{centerX:0,centerY:0,height:18,width:18},
    classNames:['loadingSpinner'],
    
    currentFrame:0,
    
    frameChangeInterval: 100,
    
    init:function(){
      sc_super();
      this.get('classNames').push(this.getPath('parentView.theme'));
      this.set('frameChangeInterval',this.getPath('parentView.frameChangeInterval'));
    },
    
    nextFrame:function(){
      var currentFrame=this.get('currentFrame');
      var offsetY=0-this.get('layout').height*currentFrame;
      this.$().css('background-position','0px %@1px'.fmt(offsetY));
      //schedule next frame if animation is still supposed to play
      if (this.get('_state')===this.get('PLAYING'))
      {
        this.invokeLater('nextFrame',this.get('frameChangeInterval'));  
      }
      currentFrame+=1;
      if (currentFrame===this.getPath('parentView.totalFrames'))
      {
        currentFrame=0;
      }
      this.set('currentFrame',currentFrame);
    }
  }),
  
  PLAYING: 'PLAYING',
  STOPPED: 'STOPPED',

  _state: 'STOPPED'

});