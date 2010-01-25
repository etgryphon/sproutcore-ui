
/** @class

  Provides a substitute view for a missing widget view.

  @extends SC.View
  @author Jonathan Lewis
*/

SCUI.MissingWidgetView = SC.View.extend( SC.Border, {
  
  // PUBLIC PROPERTIES

  layout: { left: 0, right: 0, top: 0, bottom: 0 },

  backgroundColor: 'blue',

  borderStyle: SC.BORDER_BLACK,

  message: "Widget view is missing".loc(),

  createChildViews: function() {
    var childViews = [];

    childViews.push( this.createChildView(
      SC.LabelView.design({
        layout: { left: 0, right: 0, centerY: 0, height: 30 },
        textAlign: SC.ALIGN_CENTER,
        value: this.get('message')
      })
    ));

    this.set('childViews', childViews);
  }

});
