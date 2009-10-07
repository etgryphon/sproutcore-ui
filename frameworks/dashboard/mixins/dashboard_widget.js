// ==========================================================================
// SCUI.DashboardWidget
// ==========================================================================

sc_require('core');
sc_require('mixins/widget_content');

/** @class
  
  Mixin have the DashboardWidget API the wrapper view for widgets
  
  This needs to be added to any view that will be a widget to get the full use
  of the API.
  
  @author Evin Grano
  @version 0.1
  @since 0.1
*/
SCUI.DashboardWidget = SC.merge(SCUI.WidgetContent, {
/* DashboardWidget Mixin */

  isDashboardWidget: YES,
  
  /**
    The view class to use when creating new view.
    
    The widget view will automatically create an instance of the view 
    class you set here content.  You should provide 
    your own subclass for this property to display the type of content you 
    want.
    
    For best results, the view you set here should understand the following 
    properties:
    
    - *content* The content object from the content array your view should display
    
    In general you do not want your child views to actually respond to mouse 
    and keyboard events themselves.  It is better to let the collection view 
    do that.
    
    If you do implement your own event handlers such as mouseDown or mouseUp, 
    you should be sure to actually call the same method on the widget view 
    to give it the chance to perform its own selection housekeeping.
    
    @property {SC.View}
  */
  exampleView: SC.View,
  
  /**
    This is the key on the content that will be used for the title bar
    
    @property {String}
  */
  nameKey: 'name',
  
  /**
    This is the key on the content that will be used for the size of the widget
    
    @property {String}
  */
  sizeKey: 'size',
  
  /**
    Properties to handle the size of the widget...
  */
  maxHeight: 0,
  minHeight: 0,
  editHeight: 0,
  currentHeight: 0,
  widgetMaxWidth: null,
  widgetMinWidth: 0,
  
  /**
    An content object that will be passed to the exampleView on creation
    
    This must have a property for the nameKey so that
    the widget can show the title.
    
    This is in the format:
    {
      exampleView: // Example View to Render,
      *nameKey: 'name', <= Optional, if your model name attr is different
      *sizeKey: 'size', <= Optional, if your model size attr is different
      content: {
        name: 'name',
        *size: {width: 100, height: 100} <= Optional, if your model controls the size of the widget
      }
    }
    
    @property {Object}
  */
  content: null,
  
  /**
   semi-public properties
  */
  state: SCUI.WIDGET_MAX,
  isEnabled: YES,
  isSelected: NO,
  isLocked: NO,
  
  /*
    Function for creating the actual widget view.
  */
  createWidgetView: function(margins){
    // Create Default Positioning
    if (margins === undefined) margins = {};
    if (margins.top === undefined) margins.top = 0;
    if (margins.right === undefined) margins.right = 0;
    if (margins.bottom === undefined) margins.bottom = 0;
    if (margins.left === undefined) margins.left = 0;
    
    // Now render the widget view...
    var c = this.get('content');
    var view;
    if (c){
      var viewContent = c.get('content');
      var exView = c.get('exampleView');
      var sizeKey = c.get('sizeKey') || this.get('sizeKey');
      var size = viewContent ? viewContent.get(sizeKey) : null; 
      
      // Start with the generic top position of the widget layout
      var widgetLayout = {top: margins.top};
      
      var minHeight, minWidth = this.get('widgetMinWidth'), maxWidth = this.get('widgetMaxWidth');
      // See if the Content Object defines the size of the widget...
      if (size){
        var objWidth = (size.width*1);
        if (objWidth) { 
          if (!maxWidth) maxWidth = objWidth;
          minWidth = widgetLayout.width = objWidth > maxWidth ? maxWidth : objWidth; 
          widgetLayout.centerX = 0;
        }
        else {
          widgetLayout.left = margins.left;
          widgetLayout.right = margins.right;
        }
        minHeight = widgetLayout.height = size.height ? (size.height*1) : 200;
      }
      // Check to see if the Example View defines the size
      else if (exView.prototype.layout){
        if (exView.prototype.layout.width) { 
          minWidth = widgetLayout.width = exView.prototype.layout.width; 
          widgetLayout.centerX = 0;
        }
        else {
          widgetLayout.left = margins.left;
          widgetLayout.right = margins.right;
        }
        minHeight = widgetLayout.height = exView.prototype.layout.height ? exView.prototype.layout.height : 200;
      }
      // Set the Defaults if can't fined it in the content or in the Example View
      else{
        widgetLayout.left = margins.left;
        widgetLayout.right = margins.right;
        minHeight = widgetLayout.height = 200;
      }
      
      view = this.createChildView( exView, {
        layout: widgetLayout,
        content: viewContent
      });
  
      // update this widget view layout to the right size.
      var openHeight = margins.top+minHeight+margins.bottom;
      this.set('maxHeight', openHeight);
      this.set('editHeight', openHeight);
      this.set('minHeight', (margins.top || 25));
      this.set('currentHeight', openHeight);
      this.set('widgetMinWidth', margins.left+minWidth+margins.right);
    }
    
    return view;
  },
  
  /********************************************************
  * Widget Content Code...
  ********************************************************/
  
  changePosition: function(col, idx){ 
    var c = this.get('content');
    if (c){
      var viewContent = c.get('content');
      if (viewContent && viewContent.get('isWidget')){
        return viewContent.changePosition(col, idx);
      }
    }
    return NO; 
  },
  
  minimize: function(){ 
    var c = this.get('content');
    if (c){
      var viewContent = c.get('content');
      if (viewContent && viewContent.get('isWidget')){
        return viewContent.minimize();
      }
    }
    return NO;
  },
  
  maximize: function(){ 
   var c = this.get('content');
    if (c){
      var viewContent = c.get('content');
      if (viewContent && viewContent.get('isWidget')){
        return viewContent.maximize();
      }
    }
    return NO;
  }
  
});
