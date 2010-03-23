// ========================================================================
// SCUI.LoadingSpinnerView
// ========================================================================

/**

  Implements a PNG based animated loading spinner.
  The animation is simulated, offering the benefit of using a PNG sprite for
  the actual image so that more than 256 colors and transparency may be used.

  How to use:
    {{{
    var spinner=SCUI.LoadingSpinnerView.create({
      theme:'lightTrans',
      layout:{top:0,left:0,width:50,height:50}
    });
    
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
  frameChangeInterval:200,
  
  //+1 for every append call, -1 for every remove call
  callCount:0,
  
  //call this method to show the spinner. Pass in the view you want to append the spinner to. 
  //The method will return a reference to the spinner.
  
  //make parentView optional.
  appendTo: function(parentView){
    if (this.get('callCount')===0)
    {
      parentView.appendChild(this);
    }
    this.set('isVisible',true);
    //increase append count on next runloop to make sure view has finished appending.
    this.invokeLater(function(){this.set('callCount',this.get('callCount')+1);});
    return this;
  },
  
  //Call this method to hide the spinner. 
  //Note that the spinner will only hide once all calls to append have been balanced by an equal number of calls to remove.
  remove: function(){
    this.set('callCount',this.get('callCount')-1);
    if (this.get('callCount')<=0){
      //stop animation
      this.set('_state',SCUI.LoadingSpinnerView.STOPPED);
      this.get('parentView').removeChild(this);
      this.destroy();
    }
  },
  
  //starts the animation if callCount >= 0
  callCountDidChange: function(){
    //If spinner is in a page start the animation (if needed)
    if (this.get('parentView')!==null)
    {
      if (this.get('_state')===SCUI.LoadingSpinnerView.STOPPED && this.get('callCount')>0)
      {
        this.set('isVisible',true);
        this.set('_state',SCUI.LoadingSpinnerView.PLAYING);
        this.get('spinnerView').nextFrame();
      }
    }
    //handle the case where the callCount is changed externally
    if (this.get('callCount')<=0){
      this.set('isVisible',false);
      this.set('_state',SCUI.LoadingSpinnerView.STOPPED);
    }
  }.observes('callCount'),
  
  //SCUI includes the following themes by default: darkTrans, lightTrans, darkSolidAqua, darkSolidWhite, lightSolidBlack, lightSolidGreen.
  //You can add your own themes by creating a CSS class with the name of the theme and specifying a background-image with the sprite
  //containing all the animation frames.
  theme: 'lightTrans',
  
  childViews: 'spinnerView'.w(),
  
  spinnerView: SC.View.design({
    layout:{centerX:0,centerY:0,height:18,width:18},
    classNames:['loadingSpinner'],
    
    currentFrame:0,
    
    frameChangeInterval: 200,
    
    _state:null,
    
    init:function(){
      sc_super();
      this.get('classNames').push(this.getPath('parentView.theme'));
      this.set('frameChangeInterval',this.getPath('parentView.frameChangeInterval'));
      this.set('_state',this.getPath('parentView._state'));
    },
    
    nextFrame:function(){
      var currentFrame=this.get('currentFrame');
      var offsetY=0-this.get('layout').height*currentFrame;
      this.$().css('background-position','0px %@1px'.fmt(offsetY));
      //schedule next frame if animation is still supposed to play
      if (this.get('currentState')===SCUI.LoadingSpinnerView.PLAYING)
      {
        this.invokeLater(function(){this.nextFrame();},this.get('frameChangeInterval'));  
      }
      currentFrame+=1;
      if (currentFrame===this.getPath('parentView.totalFrames'))
      {
        currentFrame=0;
      }
      this.set('currentFrame',currentFrame);
    },
    
    currentState: function(){
      return this.getPath('parentView._state');
    }.property()
  }),
  
  _state: 'STOPPED'

});

SC.mixin(SCUI.LoadingSpinnerView,{
  PLAYING: 'PLAYING',
  STOPPED: 'STOPPED'
});