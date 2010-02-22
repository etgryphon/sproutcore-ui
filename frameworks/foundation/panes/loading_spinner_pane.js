// ========================================================================
// SCUI.LoadingSpinnerPane
// ========================================================================

/**

  Extends SC.ModalPane to offer a PNG based animated loading spinner.
  The animation is simulated and the benefit of using a PNG sprite for
  the actual image is that more than 256 colors and transparency may be used.

  How to use:
    {{{
    SCUI.LoadingSpinnerPane.create({
      theme:'lightTrans'
    }).append();
    }}}

  @extends SC.ModalPane
  @author Alex Percsi

*/

SCUI.LoadingSpinnerPane = SC.ModalPane.extend({

  //Number of frames in the PNG
  totalFrames:28,
  
  //Number of millisesconds to display each frame
  frameChangeInterval:100,
  
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
      SC.RunLoop.begin();
      this.$().css('background-position','0px %@1px'.fmt(offsetY));
      SC.RunLoop.end();
      //If pane is still visible, schedule next frame
      if (this.getPath('parentView.isVisibleInWindow'))
      {
        this.invokeLater('nextFrame',this.get('frameChangeInterval'));
      
        currentFrame+=1;
        if (currentFrame===this.getPath('parentView.totalFrames'))
        {
          currentFrame=0;
        }
      }
      this.set('currentFrame',currentFrame);
    },
    
    parentDidAppend: function(){
      if (this.getPath('parentView.isVisibleInWindow')){
        this.nextFrame();
      }
    }.observes('.isVisibleInWindow')
    
  })

});