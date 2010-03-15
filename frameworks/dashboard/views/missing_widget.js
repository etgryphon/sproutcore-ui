
/** @class

  Provides a substitute view for a missing widget view.

  @extends SC.View
  @author Jonathan Lewis
*/

SCUI.MissingWidgetView = SC.View.extend( SC.Border, {
  
  // PUBLIC PROPERTIES

  layout: { left: 0, right: 0, top: 0, bottom: 0 },
  
  message: "Widget is missing or broken. Please remove and replace this widget using the plus button in the bottom left.".loc(),
  
  classNames: 'missing-widget'.w(),

  createChildViews: function() {
    var childViews = [];

    childViews.push( this.createChildView(
      SC.LabelView.design({
        layout: { left: 10, right: 10, centerY: 0, height: 40 },
        textAlign: SC.ALIGN_CENTER,
        value: this.get('message')
      })
    ));

    this.set('childViews', childViews);
  }

});

