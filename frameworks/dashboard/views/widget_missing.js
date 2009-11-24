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

  layout: { width: 400, height: 200 },
  
  backgroundColor: 'gray',

  borderStyle: SC.BORDER_BLACK,

  /**
    The widget content model
  */
  content: null,

  /**
    Bound to '*content.name'
  */
  widgetName: null,

  /**
    @read-only
    
    The error message that will be displayed on the view.
  */
  message: function() {
    var widgetName = this.get('widgetName') || '%@'.fmt(this.get('content'));
    return "Widget view missing for '%@'".loc(widgetName);
  }.property('widgetName').cacheable(),

  // PUBLIC METHODS
  
  init: function() {
    var nameKey;

    sc_super();

    nameKey = this.get('nameKey') || 'name';
    this.bind('widgetName', SC.Binding.from('*content.%@'.fmt(nameKey), this).oneWay());

    this.bind('value', SC.Binding.from('.message', this)).oneWay();
  }
  
});
