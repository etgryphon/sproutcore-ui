// ==========================================================================
// SCUI.WidgetView
// ==========================================================================

sc_require('core');

/** @class

  This is a management view that handles a widget.  Implements the Widget Mixin

  @extends SC.View
  @author Evin Grano
  @version 0.1
  @since 0.1
*/

SCUI.WidgetView = SC.View.extend( SCUI.DashboardWidget,
/** @scope SCUI.WidgetView.prototype */ {
  
  classNames: ['scui-widget-view'],
  
  /**
    @private
  */
  _titleView: null,
  _widgetView: null,
  _titleHeight: 25,
  
  createChildViews: function(){
    var view, childViews = [];
    var c = this.get('content');
    if (c) {
      var viewContent = c.get('content');
      var nameKey = c.get('nameKey') || this.get('nameKey');
      var title = viewContent ? viewContent.get(nameKey) : ' ';
    
      // First, Create the Title Bar
      view = this._titleView = this.createChildView( SC.LabelView, {
        classNames: ['scui-widgettitle-view'],
        layout: {top: 0, left: 0, right: 0, height: this._titleHeight},
        isEditable: NO,
        value: title
      });
      childViews.push(view);
    
      // Second, Implement the widget view
      var margins = {top: this._titleHeight};
      view = this._widgetView = this.createWidgetView(margins);
      childViews.push(view);
    }
    
    this.set('childViews', childViews);
  }
  
});