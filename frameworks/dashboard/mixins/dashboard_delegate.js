// ==========================================================================
// SCUI.DashboardDelegate
// ==========================================================================

/** @mixin

  Mixin for delegates of SCUI.DashboardView so that it can request unique
  widget views on a per widget basis.

  @author Jonathan Lewis
  @author Evin Grano
*/

SCUI.DashboardDelegate = {

  // PUBLIC PROPERTIES

  isDashboardDelegate: YES,

  // PUBLIC METHODS

  /**
    Called by the SCUI.DashboardView when it needs a widget view class
    for a particular widget item.  Returning null causes SCUI.DashboardView
    to use the default SCUI.WidgetMissingView for that widget.
    
    dashboardView: the calling dashboard view.
    content: the dashboard view's content.
    contentIndex: the index of 'content' in the widget array.
    item: for convenience, the item itself

    Return null, a view class, or a string containing the fully qualified name of a view class.
  */
  dashboardWidgetViewFor: function(dashboardView, content, contentIndex, item) {
    //console.log('%@.dashboardWidgetViewFor()'.fmt(this));
    return null;
  },
  
  dashboardWidgetEditViewFor: function(dashboardView, content, contentIndex, item) {
    //console.log('%@.dashboardWidgetEditViewFor()'.fmt(this));
    return null;
  }

};
