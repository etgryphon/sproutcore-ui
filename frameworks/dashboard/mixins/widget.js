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
  
  /** @optional
    Defines the property containing the view class that should be shown as the face of the widget.
    May be a view class, i.e.
      
      widgetViewClass: SC.View.design({ ... })

    or a fully qualified class name string, i.e.
    
      widgetViewClass: 'MyApp.MyWidgetView'

    If this is not defined, the dashboard will ask its delegate for the appropriate view class.
  */
  widgetViewClassKey: 'widgetViewClass',

  /** @optional
    Same as 'widgetViewClass', except this defines the view shown when 'isEditing' is true.
    If this is not defined, the dashboard will ask its delegate for the appropriate view class.
  */
  widgetEditViewClassKey: 'widgetEditViewClass',
  
  /**
    The property that stores this widget's position.  Position is expressed
    as a hash like this: { x: 100, y: 200 }.
  */
  positionKey: 'position',

  /**
    @optional

    The property expected to hold the name of the widget.
  */
  nameKey: 'name',

  /**
    Controls whether or not the widget is allowed to move.
  */
  isLocked: NO,
  
  /**
    If YES, shows edit button on the widget and allows switching to widget edit view.
  */
  isEditable: YES,

  /**
    If YES, shows widget edit view, otherwise shows normal widget view.
  */
  isEditing: NO,

  /**
    If YES, overlays a "Done" button on the widget's edit view.
  */
  showDoneButton: YES,
  
  // PUBLIC METHODS
  
  /**
    Called by SCUI.DashboardView whenever the dashboard wants to move the widget to a new
    location, prior to calling 'set(positionKey)'.  I.e. when someone finishes dragging a widget.
    Override this to handle this notification and control moving permissions.
    
    'newPosition' contains the proposed new location of the top-left corner of the widget view
    in the form { x: 3, y: 4 }.
    
    Return whatever position you'd like to be the final position, or null to forbid the move.
  */
  widgetProposedMove: function(newPosition) {
    return newPosition; // allow the move by default; return null or another desired position to forbid
  }
  
};
