// ==========================================================================
// SCUI.ClockWidget
// ==========================================================================

sc_require('models/clock_widget');

/** @class

  This file defines the two views required for a basic clock sample widget.

  ClockWidgetView is the normal clock face for the widget.
  ClockWidgetEditView is the configuration view for the widget.

  @author Jonathan Lewis
*/

SCUI.ClockWidgetView = SC.View.extend({

  // PUBLIC PROPERTIES
  
  layout: { left: 0, right: 0, top: 0, bottom: 0 },

  content: null, // SCUI.ClockWidget object

  childViews: ['clockView'],

  clockView: SC.View.design({
    classNames: ['scui-clock-widget-view'],
    layout: { left: 0, right: 0, top: 0, bottom: 0 },
    childViews: ['labelView'],

    labelView: SC.LabelView.design({
      layout: { left: 10, right: 10, centerY: 0, height: 48 },
      tagName: 'h1',
      valueBinding: '.parentView.parentView*content.value'
    })
  })
  
});

SCUI.ClockWidgetEditView = SC.View.extend({
  
  // PUBLIC PROPERTIES
  
  layout: { left: 0, right: 0, top: 0, bottom: 0 },

  content: null, // SCUI.ClockWidget object

  childViews: ['optionView'],

  optionView: SC.View.design({
    classNames: ['scui-clock-widget-view'],
    layout: { left: 0, right: 0, top: 0, bottom: 0 },
    childViews: ['checkboxView'],

    checkboxView: SC.CheckboxView.design({
      layout: { centerX: 0, centerY: 0, width: 130, height: 18 },
      title: "Show Greeting".loc(),
      valueBinding: '.parentView.parentView*content.showGreeting'
    })
  })
  
});
