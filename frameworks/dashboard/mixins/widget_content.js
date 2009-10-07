// ==========================================================================
// SCUI.Widget
// ==========================================================================

/** @class
  
  Mixin have the WidgetContent API for Column, Index, and State Integration
  
  This needs to be added to any view that will be a widget to get the full use
  of the API.
  
  @author Evin Grano
  @version 0.1
  @since 0.1
*/
SCUI.WidgetContent = {
/* Widget Mixin */

  isWidget: YES,
  
  /**
    @public:  
    
    This function will be called by the dashboard when a widget is moved from one position to another.
    Please implement the functionality on your view to update your model.
    By Default this will do nothing
    
    @param {Number} col
    @param {Number} idx
    @return {Boolean}
  */
  changePosition: function(col, idx){ return YES; },
  
  /**
    @public

    This function is called when a widget is minimized.
    Please implement the functionality to store the state of the object on your model
    By default, this will do nothing
    
    @return {Boolean}
  */
  minimize: function(){ return YES; },
  
  /**
    @public

    This function is called when a widget is maximized.
    Please implement the functionality to store the state of the object on your model
    By default, this will do nothing
    
    @return {Boolean}
  */
  maximize: function(){ return YES; }
};