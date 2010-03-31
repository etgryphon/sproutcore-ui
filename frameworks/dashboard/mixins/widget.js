/*globals SCUI */

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
      
      widgetViewClass: SC.View.extend({ ... })

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
    The property that stores this widget's size.  Size is expressed
    as a hash like this: { width: 300, height: 100 }.
  */
  sizeKey: 'size',

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
  canEdit: YES,

  isEditing: NO,

  /**
    If YES, overlays a "Done" button on the widget's edit view.
  */
  showDoneButton: YES,
  
  // PUBLIC METHODS

  /**
    Called by the dashboard view after someone finishes dragging this widget.
  */
  widgetDidMove: function() {}
  
};

