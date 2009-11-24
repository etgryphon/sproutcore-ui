// ==========================================================================
// SCUI.Widget
// ==========================================================================

sc_require('core');

/** @class

  A convenience mixin for widget content.  This defines the API that
  SCUI.DashboardView will use when attempting to communicate with the content
  model of each widget.

  @author Jonathan Lewis
  @author Evin Grano

*/
SCUI.Widget = {
/* Widget Mixin */

  // PUBLIC PROPERTIES

  isWidget: YES,
  
  /**
    The property that stores this widget's position.  Position is expressed
    as a hash like this: { x: 100, y: 200 }.
  */
  positionKey: 'position',

  /**
    @optional

    The property that stores this widget's width and height.  Size is expressed
    as a hash like this: { width: 400, height: 200 }.

    Using this property is optional.  If a 'size' property (or whatever you call it)
    is not provided or is null, the dashboard will attempt to extract the size from
    the widget's widget view itself.
  */
  sizeKey: 'size',

  /**
    @optional

    The property expected to hold the name of the widget.
  */
  nameKey: 'name',
  
  // PUBLIC METHODS
  
  /**
    Called by SCUI.DashboardView whenever the widget is dragged to a new
    location.  Override this to handle this notification.  'newPosition' contains
    the new location of the top-left corner of the widget view in the form { x: 3, y: 4 }.
    
    Note that 'this[positionKey]' will have already been set to the new position
    by the time this method is called, so no action is necessary on your part unless
    there is something special you want to do as a result of a position change.
  */
  widgetDidMove: function(newPosition) {
    // override to handle this notification
  }

};
