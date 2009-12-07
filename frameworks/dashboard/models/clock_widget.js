// ==========================================================================
// SCUI.ClockWidget
// ==========================================================================

sc_require('mixins/widget');

/** @class

  Defines a basic sample widget based on the Sproutcore sample "clock" app.
  This is the widget object that mixes in the SCUI.Widget API

  @author Jonathan Lewis
*/

SCUI.ClockWidget = SC.Object.extend( SCUI.Widget, {

  // PUBLIC PROPERTIES

  /**
    SCUI.Widget API: the face view for the widget (see clock_widget.js)
  */
  widgetViewClass: 'SCUI.ClockWidgetView',

  /**
    SCUI.Widget API: the edit view for the widget (see clock_widget.js)
  */
  widgetEditViewClass: 'SCUI.ClockWidgetEditView',

  /**
    SCUI.Widget API: the position of the widget
  */
  position: { x: 40, y: 40 },

  showGreeting: NO,
  
  greeting: "Hello World".loc(),
  
  now: '--',
  
  value: function() {
    return this.get(this.get('showGreeting') ? 'greeting' : 'now') ;
  }.property('showGreeting', 'greeting', 'now').cacheable(),

  // PUBLIC METHODS
  
  init: function() {
    sc_super();
    this.tick();
  },
  
  tick: function() {
    this.set('now', new Date().format('hh:mm:ss'));
    this.invokeLater(this.tick, 1000);
  }
  
});
