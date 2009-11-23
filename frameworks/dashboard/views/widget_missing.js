// ==========================================================================
// SCUI.WidgetMissingView
// ==========================================================================

sc_require('core');

/** @class

  This is used in conjunction with SCUI.DashboardView to provide a default
  widget view in case the dashboard cannot find the right one.  It acts as
  a placeholder view with an error message.

  @extends SC.LabelView, SC.Border
  @author Jonathan Lewis
*/

SCUI.WidgetMissingView = SC.LabelView.extend( SC.Border, {
  
  // PUBLIC PROPERTIES
  
  classNames: ['scui-widget-missing-view'],
  
  backgroundColor: 'gray',
  borderStyle: SC.BORDER_BLACK,
  
  layout: { width: 400, height: 200 },

  content: null,

  value: "Widget view missing".loc(),

  // PUBLIC METHODS
  
  init: function() {
    sc_super();

    // construct an error message
    var content = this.get('content');
    this.set('value', "Widget view missing for %@".loc(content));
  }
  
});
