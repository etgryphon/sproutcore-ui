
/** @class

  This is a Drawing Pane:
  
  @extends SC.Pane
  @since SproutCore 1.0
*/
SCUI.DrawingPane = SC.Pane.extend({
  
  classNames: 'scui-drawing-pane',
  
  /** @private cover the entire screen */
  layout: { top: 0, left: 0, bottom: 0, right: 0 }
  
});

