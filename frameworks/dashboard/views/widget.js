// ==========================================================================
// SCUI.WidgetView
// ==========================================================================

sc_require('core');

/** @class

  Provides a widget container view used by the SCUI.DashboardView.  It holds
  one widget, overlays widget button views, and swaps between widget face and
  widget edit views.

  This widget container adjust its layout to fit the widget views it contains.

  @extends SC.View
  @author Jonathan Lewis
*/

SCUI.WidgetView = SC.View.extend( SC.Control, {

  // PUBLIC PROPERTIES
  
  classNames: ['scui-widget-view'],

  /**
    Should be an object mixing in SCUI.Widget
  */
  content: null,

  /**
    Controls whether or not we are showing the delete handle over this widget.
  */
  canDeleteWidget: NO,
  
  /**
    Controls whether we are showing the widget face or the widget edit view.
  */
  isEditing: NO,

  /**
    Default layout, only needed as a last resort
  */
  layout: { left: 0, top: 0, width: 400, height: 200 },

  /**
    The view class to be used as the widget face (set automatically by the dashboard)
  */
  widgetViewClass: null,

  /**
    The view class to be used as the widget's edit view (set automatically by the dashboard)
  */
  widgetEditViewClass: null,

  /**
    View class to use for each widget's delete button.  Whatever view class is used here
    should be capable of acting like a button, and should have 'target' and 'action' properties
    that get fired when it is clicked.  These will be assigned values automatically for you when
    the view is instantiated.
  */
  deleteHandleViewClass: SC.View.design( SCUI.SimpleButton, {
    classNames: ['scui-widget-delete-handle-view'],
    layout: { left: 0, top: 0, width: 28, height: 28 }
  }),

  /**
    View class to use for each widget's optional edit button.  Whatever view class is used here
    should be capable of acting like a button, and should have 'target' and 'action' properties
    that get fired when it is clicked.  These will be assigned values automatically for you when
    the view is instantiated.
  */
  editHandleViewClass: SC.View.design( SCUI.SimpleButton, {
    classNames: ['scui-widget-edit-handle-view'],
    layout: { right: 0, top: 0, width: 28, height: 28 }
  }),

  /**
    View class to use for each widget's optional "done editing" button.  Whatever view class is used here
    should be capable of acting like a button, and should have 'target' and 'action' properties
    that get fired when it is clicked.  These will be assigned values automatically for you when
    the view is instantiated.
  */
  doneButtonViewClass: SC.ButtonView.design({
    classNames: ['scui-widget-done-button-view'],
    layout: { right: 10, bottom: 10, width: 80, height: 24 },
    title: "Done".loc()
  }),

  displayProperties: ['canDeleteWidget', 'isEditing'],
  
  // PUBLIC METHODS

  init: function() {
    sc_super();
    this.bind('isEditing', SC.Binding.from('*content.isEditing', this));
  },

  /**
    Note this method creates all the child views we will need, but does not add them
    to the childViews array immediately.  We use didCreateLayer() to trigger adding the
    correct set of child views at run-time.
  */
  createChildViews: function() {
    var viewClass;
    var content = this.get('content');
    var frame;
    
    // create the widget view
    viewClass = this._getViewClass('widgetViewClass');
    if (!viewClass) {
      viewClass = SC.LabelView.design( SC.Border, {
        value: "Widget view is missing.".loc(),
        backgroundColor: 'blue',
        borderStyle: SC.BORDER_BLACK,
        textAlign: SC.ALIGN_CENTER
      });
    }

    this._widgetView = this.createChildView(viewClass.design(), { content: content });
    frame = this._widgetView.get('frame');
    this._widgetView.set('layout', { left: 0, top: 0, width: frame.width, height: frame.height });
    
    // create the edit view
    viewClass = this._getViewClass('widgetEditViewClass');
    if (!viewClass) {
      viewClass = SC.LabelView.design( SC.Border, {
        value: "Widget's edit view is missing.".loc(),
        backgroundColor: 'yellow',
        borderStyle: SC.BORDER_BLACK,
        textAlign: SC.ALIGN_CENTER
      });
    }
    
    this._editView = this.createChildView(viewClass.design(), { content: content });
    frame = this._editView.get('frame');
    this._editView.set('layout', { left: 0, top: 0, width: frame.width, height: frame.height });

    // create the delete handle view
    viewClass = this._getViewClass('deleteHandleViewClass');
    if (viewClass) {
      this._deleteHandleView = this.createChildView(viewClass.design(), { target: this, action: 'deleteWidget' });
    }

    // create the edit handle view
    viewClass = this._getViewClass('editHandleViewClass');
    if (viewClass) {
      this._editHandleView = this.createChildView(viewClass.design(), { target: this, action: 'beginEditing' });
    }

    // create the done button
    viewClass = this._getViewClass('doneButtonViewClass');
    if (viewClass) {
      this._doneButtonView = this.createChildView(viewClass.design(), { target: this, action: 'commitEditing' });
    }
  },

  didCreateLayer: function() {
    sc_super();
    this._isEditingDidChange();
    this._canDeleteWidgetDidChange();
  },

  /**
    Gets called when any of the child view layouts change.  Use this notification to resize this view
    if either of the widget views changes.
  */
  layoutChildViews: function() {
    //console.log('%@.layoutChildViews(%@)'.fmt(this, this._needLayoutViews));
    var set = this._needLayoutViews;
    var len = set ? set.length : 0;
    var i, view, frame;

    for (i = 0; i < len; i++) {
      view = set[i];
      if (view === this._activeView) {
        frame = view.get('frame');
        this.adjust({ width: frame.width, height: frame.height });
        break;
      }
    }

    return sc_super();
  },

  beginEditing: function() {
    var content;

    if (this.getPath('content.isEditable')) {
      this.setIfChanged('isEditing', YES);

      content = this.get('content');
      if (content && content.beginEditing) {
        content.beginEditing();
      }
    }
  },

  commitEditing: function() {
    var content;
    
    this.setIfChanged('isEditing', NO);

    content = this.get('content');
    if (content && content.commitEditing) {
      content.commitEditing();
    }
  },
  
  deleteWidget: function() {
    var owner = this.get('owner');
    if (owner && owner.deleteWidget) {
      owner.deleteWidget(this.get('content'));
    }
  },
  
  // PRIVATE METHODS
  
  _adjustLayoutToFitContent: function() {
    var contentView = this.get('isEditing') ? this._editView : this._widgetView;
    var frame;
    
    if (contentView) {
      frame = contentView.get('frame');
      this.adjust({ width: frame.width, height: frame.height });
    }
  },

  _isEditingDidChange: function() {
    //console.log('%@._isEditingDidChange(isEditing: %@)'.fmt(this, this.get('isEditing')));
    if (this.get('isEditing')) {
      // swap to the widget's editing view
      if (!this._activeView || (this._activeView === this._widgetView)) {
        this.replaceChild(this._editView, this._widgetView);
        this._activeView = this._editView;
      }

      // remove the edit handle
      this.removeChild(this._editHandleView);
      this._isShowingEditHandle = NO;

      // add a done button if desired
      if (!this._isShowingDoneButton && this.getPath('content.showDoneButton') && this._doneButtonView) {
        this.insertBefore(this._doneButtonView, this._deleteHandleView);
        this._isShowingDoneButton = YES;
      }
    }
    else {
      // swap to the widget's face view
      if (!this._activeView || (this._activeView === this._editView)) {
        this.replaceChild(this._widgetView, this._editView);
        this._activeView = this._widgetView;
      }

      // remove the done button
      this.removeChild(this._doneButtonView);
      this._isShowingDoneButton = NO;

      if (this.getPath('content.isEditable')) { // if editable, show the edit handle
        if (!this._isShowingEditHandle && this._editHandleView) {
          this.insertBefore(this._editHandleView, this._deleteHandleView);
          this._isShowingEditHandle = YES;
        }
      }
      else { // if not editable, make sure it has no edit handle
        this.removeChild(this._editHandleView);
        this._isShowingEditHandle = NO;
      }
    }
    
    this._adjustLayoutToFitContent();
  }.observes('isEditing'),

  _canDeleteWidgetDidChange: function() {
    //console.log('%@._canDeleteWidgetDidChange(canDeleteWidget: %@)'.fmt(this, this.get('canDeleteWidget')));
    if (this.get('canDeleteWidget')) {
      if (!this._isShowingDeleteHandle && this._deleteHandleView) {
        this.appendChild(this._deleteHandleView);
        this._isShowingDeleteHandle = YES;
      }
    }
    else {
      this.removeChild(this._deleteHandleView);
      this._isShowingDeleteHandle = NO;
    }
  }.observes('canDeleteWidget'),
  
  _getViewClass: function(viewKey) {
    var c = this.get(viewKey); // hopefully the view class
    var t, root, key;
    
    // if it's a string class name, try to materialize it
    if (SC.typeOf(c) === SC.T_STRING) {
      t = SC.tupleForPropertyPath(c);
      if (t) {
        root = t[0];
        key = t[1];
        c = root.get ? root.get(key) : root[key];
      }
    }
    
    return (c && c.kindOf(SC.View)) ? c : null;
  },
  
  // PRIVATE PROPERTIES
  
  _widgetView: null,
  _editView: null,
  _activeView: null,

  _deleteHandleView: null,
  _editHandleView: null,
  _doneButtonView: null,
  
  _isShowingDeleteHandle: NO,
  _isShowingEditHandle: NO,
  _isShowingDoneButton: NO

});
